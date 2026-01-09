const authService = require('../services/auth.service');

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    console.log('LOGIN RESULT FROM SERVICE:', result);

    if (result.error === 'USERNAME_EXISTS') {
      return res.status(409).json({
        message: 'Username already exists'
      });
    }

    if (result.error === 'EMAIL_EXISTS') {
      return res.status(409).json({
        message: 'Email already exists'
      });
    }

    res.status(201).json({
      message: 'Register success',
      user: result
    });

  } catch (err) {
    console.error(err);

    // fallback nếu DB unique constraint bắn lỗi
    if (err.code === '23505') {
      return res.status(409).json({
        message: 'Username or email already exists'
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    console.log('LOGIN RESULT FROM SERVICE:', result);

    if (result.error) {
      return res.status(401).json({ message: 'INVALID USER OR PASSWORD' });
    }

    res.json({
      message: 'Login success',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } 
  catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  }

};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    await authService.logout(refreshToken);

    res.json({ message: 'Logout success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
