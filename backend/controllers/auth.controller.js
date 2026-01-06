const authService = require('../services/auth.service');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      message: 'Register success',
      user
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    if (result.error === 'USER_NOT_FOUND' || result.error === 'INVALID_PASSWORD') {
      return res.status(401).json({ message: 'INVALID USER OR PASSWORD' });
    }

    const user = result.user;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login success',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
