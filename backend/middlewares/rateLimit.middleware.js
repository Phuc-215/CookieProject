const rateLimit = require('express-rate-limit');

// Limit brute-force on login: 20 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'TOO_MANY_LOGIN_ATTEMPTS' },
});

// Limit account security checks: verify-password
const verifyPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'TOO_MANY_ATTEMPTS' },
});

module.exports = { loginLimiter, verifyPasswordLimiter };
