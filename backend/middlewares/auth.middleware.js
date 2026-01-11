const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'UNAUTHORIZED' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure id is always an integer
    req.user = {
      ...payload,
      id: parseInt(payload.id, 10)
    };
    console.log('Authenticated user:', req.user);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'TOKEN_INVALID' });
  }
};

exports.requireVerifiedEmail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT is_verified FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'USER_NOT_FOUND' });
    }
    
    const user = result.rows[0];
    if (!user.is_verified) {
      return res.status(403).json({ message: 'EMAIL_NOT_VERIFIED' });
    }
    
    next();
  } catch (err) {
    console.error('VERIFY EMAIL MIDDLEWARE ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional auth: set req.user if Bearer token is provided and valid; otherwise continue silently
exports.maybeAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { ...payload, id: parseInt(payload.id, 10) };
  } catch (err) {
    // ignore invalid token to keep route public
  }

  return next();
};
