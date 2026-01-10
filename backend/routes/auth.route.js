// routes/auth.route.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { loginLimiter, verifyPasswordLimiter } = require('../middlewares/rateLimit.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
	registerSchema,
	loginSchema,
	refreshTokenSchema,
	resetPasswordRequestSchema,
	verifyResetCodeSchema,
	resetPasswordConfirmSchema,
} = require('../validations/auth.validation');

console.log('Auth routes loaded', controller);

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', loginLimiter, validate(loginSchema), controller.login);
router.post('/logout', controller.logout);
router.post('/verify-email', controller.verifyEmail);
router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
router.post('/request-password-reset', validate(resetPasswordRequestSchema), controller.requestPasswordReset);
router.post('/verify-reset-code', validate(verifyResetCodeSchema), controller.verifyResetCode);
router.post('/reset-password', validate(resetPasswordConfirmSchema), controller.resetPassword);
router.post('/verify-password', requireAuth, verifyPasswordLimiter, controller.verifyPassword);
router.put('/change-password', requireAuth, controller.changePassword);


module.exports = router;
