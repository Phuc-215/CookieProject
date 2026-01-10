const { signAccessToken, signRefreshToken, signVerificationToken, verifyToken, signResetToken, generateVerificationCode } = require('../utils/jwt');
const { comparePassword } = require('../utils/password');
const { pool } = require('../config/db');
const { hashPassword } = require('../utils/password');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./email.service');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.login = async ({ email, password }) => {
  email = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT id, email, username, avatar_url, password_hash
     FROM users WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) return { error: 'USER_NOT_FOUND' };

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) return { error: 'INVALID_PASSWORD' };

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar_url: user.avatar_url
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: user.id });

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [user.id, refreshToken]
  );

  return {
    user: payload,
    accessToken,
    refreshToken
  };
};

exports.register = async ({ username, email, password }) => {
  username = username.trim();
  email = email.trim().toLowerCase();

  const usernameCheck = await pool.query(
    `SELECT id FROM users WHERE username = $1`,
    [username]
  );

  if (usernameCheck.rowCount > 0) {
    return { error: 'USERNAME_EXISTS' };
  }

  const emailCheck = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );

  if (emailCheck.rowCount > 0) {
    return { error: 'EMAIL_EXISTS' };
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, is_verified)
     VALUES ($1, $2, $3, false)
     RETURNING id, username, email, avatar_url`,
    [username, email, passwordHash]
  );

  const newUser = result.rows[0];

  // Generate 6-digit verification code
  const verificationCode = generateVerificationCode();

  // Save verification code to DB (valid for 24 hours)
  await pool.query(
    `INSERT INTO verification_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
    [newUser.id, verificationCode]
  );

  // Send verification code to email
  await sendVerificationEmail(newUser.email, verificationCode);

  // Generate JWT tokens for immediate login
  const payload = {
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
    avatar_url: newUser.avatar_url
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: newUser.id });

  // Save refresh token to DB
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [newUser.id, refreshToken]
  );

  return {
    user: payload,
    accessToken,
    refreshToken,
    verificationCode // Return code for testing (remove in production)
  };
};

exports.logout = async (refreshToken) => {
  if (!refreshToken) return;

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return;
  }

  await pool.query(
    `DELETE FROM refresh_tokens WHERE token = $1`,
    [refreshToken]
  );
};

exports.verifyEmail = async (code) => {
  // Validate code format (6 digits)
  if (!code || !/^\d{6}$/.test(code.toString())) {
    return { error: 'Invalid verification code format' };
  }

  // Check if code exists in DB and not expired
  const codeCheck = await pool.query(
    `SELECT user_id FROM verification_tokens 
     WHERE token = $1 AND expires_at > NOW()`,
    [code.toString()]
  );

  if (codeCheck.rowCount === 0) {
    return { error: 'Verification code expired or invalid' };
  }

  const userId = codeCheck.rows[0].user_id;

  // Update user as verified
  await pool.query(
    `UPDATE users SET is_verified = true WHERE id = $1`,
    [userId]
  );

  // Delete verification code
  await pool.query(
    `DELETE FROM verification_tokens WHERE token = $1`,
    [code.toString()]
  );

  return { success: true };
};

exports.refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    return { error: 'Refresh token required' };
  }

  // Verify refresh token signature
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return { error: 'Invalid or expired refresh token' };
  }

  // Check if refresh token exists in DB and not expired
  const tokenCheck = await pool.query(
    `SELECT user_id FROM refresh_tokens 
     WHERE token = $1 AND expires_at > NOW()`,
    [refreshToken]
  );

  if (tokenCheck.rowCount === 0) {
    return { error: 'Refresh token expired or revoked' };
  }

  const userId = tokenCheck.rows[0].user_id;

  // Get user info
  const userResult = await pool.query(
    `SELECT id, email, username FROM users WHERE id = $1`,
    [userId]
  );

  if (userResult.rowCount === 0) {
    return { error: 'User not found' };
  }

  const user = userResult.rows[0];

  // Generate new tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    username: user.username
  };

  const newAccessToken = signAccessToken(tokenPayload);
  const newRefreshToken = signRefreshToken({ id: user.id });

  // Delete old refresh token and insert new one (token rotation)
  await pool.query(
    `DELETE FROM refresh_tokens WHERE token = $1`,
    [refreshToken]
  );

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [userId, newRefreshToken]
  );

  return {
    user: tokenPayload,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

exports.requestPasswordReset = async (email) => {
  email = email.trim().toLowerCase();

  // Check if user exists
  const userResult = await pool.query(
    `SELECT id, email, username FROM users WHERE email = $1`,
    [email]
  );

  if (userResult.rowCount === 0) {
    // For security, don't reveal if email exists
    return { success: true };
  }

  const user = userResult.rows[0];

  // Generate 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete any existing reset codes for this user
  await pool.query(
    `DELETE FROM password_reset_tokens WHERE user_id = $1`,
    [user.id]
  );

  // Save reset code to DB (valid for 15 minutes)
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
    [user.id, resetCode]
  );

  // Send reset email with code
  await sendPasswordResetEmail(user.email, resetCode);

  return { success: true };
};

exports.verifyResetCode = async (code) => {
  // Validate code format (6 digits)
  if (!code || !/^\d{6}$/.test(code.toString())) {
    return { error: 'Invalid reset code format' };
  }

  // Check if code exists in DB and not expired
  const codeCheck = await pool.query(
    `SELECT user_id FROM password_reset_tokens 
     WHERE token = $1 AND expires_at > NOW()`,
    [code.toString()]
  );

  if (codeCheck.rowCount === 0) {
    return { error: 'Reset code expired or invalid' };
  }

  return { success: true, code: code.toString() };
};

exports.resetPassword = async (code, newPassword) => {
  // Validate code exists and not expired
  const codeResult = await pool.query(
    `SELECT user_id FROM password_reset_tokens 
     WHERE token = $1 AND expires_at > NOW()`,
    [code]
  );

  if (codeResult.rowCount === 0) {
    return { error: 'Invalid or expired reset code' };
  }

  const userId = codeResult.rows[0].user_id;

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update user password
  await pool.query(
    `UPDATE users SET password_hash = $1 WHERE id = $2`,
    [passwordHash, userId]
  );

  // Delete reset code
  await pool.query(
    `DELETE FROM password_reset_tokens WHERE token = $1`,
    [code]
  );

  // Revoke all refresh tokens for security
  await pool.query(
    `DELETE FROM refresh_tokens WHERE user_id = $1`,
    [userId]
  );

  return { success: true };
};

exports.verifyPassword = async (userId, password) => {
  const result = await pool.query(
    `SELECT password_hash FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rowCount === 0) {
    return { error: 'USER_NOT_FOUND' };
  }

  const user = result.rows[0];
  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    return { error: 'INVALID_PASSWORD' };
  }

  return { valid: true };
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  // Verify current password first
  const verifyResult = await exports.verifyPassword(userId, currentPassword);
  if (verifyResult.error) {
    return verifyResult;
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password
  await pool.query(
    `UPDATE users SET password_hash = $1 WHERE id = $2`,
    [passwordHash, userId]
  );

  // Revoke all refresh tokens for security
  await pool.query(
    `DELETE FROM refresh_tokens WHERE user_id = $1`,
    [userId]
  );

  return { success: true };
};
