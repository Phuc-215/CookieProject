const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { comparePassword } = require('../utils/password');
const { pool } = require('../config/db');
const { hashPassword } = require('../utils/password');



exports.login = async ({ email, password }) => {
  email = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT id, email, username, password_hash
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
    username: user.username
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
    'SELECT id FROM users WHERE username = $1',
    [username]
  );

  if (usernameCheck.rowCount > 0) {
    return { error: 'USERNAME_EXISTS' };
  }

  const emailCheck = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (emailCheck.rowCount > 0) {
    return { error: 'EMAIL_EXISTS' };
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email`,
    [username, email, passwordHash]
  );

  return result.rows[0];
};
