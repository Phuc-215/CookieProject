// routes/auth.route.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { loginLimiter, verifyPasswordLimiter } = require('../middlewares/rateLimit.middleware');

console.log('Auth routes loaded', controller);

router.post('/register', controller.register);
router.post('/login', loginLimiter, controller.login);
router.post('/logout', controller.logout);
router.post('/verify-email', controller.verifyEmail);
router.post('/refresh', controller.refresh);
router.post('/request-password-reset', controller.requestPasswordReset);
router.post('/verify-reset-code', controller.verifyResetCode);
router.post('/reset-password', controller.resetPassword);
router.post('/verify-password', requireAuth, verifyPasswordLimiter, controller.verifyPassword);
router.put('/change-password', requireAuth, controller.changePassword);


module.exports = router;
