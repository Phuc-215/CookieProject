const jwt = require('jsonwebtoken');

exports.signAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

exports.signRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

exports.signVerificationToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_VERIFICATION_SECRET || process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

exports.generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.signResetToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

exports.verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};
