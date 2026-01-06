const { pool } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');

exports.register = async ({ username, email, password }) => {
  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email`,
    [username, email, passwordHash]
  );

  return result.rows[0];
};

exports.login = async ({ email, password }) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    return { error: 'USER_NOT_FOUND' };
  }

  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    return { error: 'INVALID_PASSWORD' };
  }

  return { user };
};
