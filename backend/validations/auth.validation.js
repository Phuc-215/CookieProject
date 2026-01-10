const joi = require('joi');

const registerSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required()
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required()
});

const refreshTokenSchema = joi.object({
  refreshToken: joi.string().required()
});

const resetPasswordRequestSchema = joi.object({
  email: joi.string().email().required()
});

const verifyResetCodeSchema = joi.object({
  code: joi.string().regex(/^\d{6}$/).required()
});

const resetPasswordConfirmSchema = joi.object({
  code: joi.string().regex(/^\d{6}$/).required(),
  newPassword: joi.string().min(6).required()
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordRequestSchema,
  verifyResetCodeSchema,
  resetPasswordConfirmSchema
};
