const authService = require('../services/auth.service');
const { signToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  const user = await authService.register(req.body);
  res.json(user);
};

exports.login = async (req, res) => {
  const user = await authService.login(req.body);
  const token = signToken({ userId: user.id });
  res.json({ token });
};
