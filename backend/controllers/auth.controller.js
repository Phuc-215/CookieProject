const authService = require('../services/auth.service');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validations/auth.validation');

exports.register = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const result = await authService.register(value);
    console.log('REGISTER RESULT FROM SERVICE:', result);

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

    // Return user info + tokens on successful registration
    res.status(201).json({
      message: 'Register success. Please verify your email.',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      verificationToken: result.verificationToken
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

exports.verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Verification code required' });
    }

    const result = await authService.verifyEmail(code);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.refresh = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const result = await authService.refreshToken(value.refreshToken);

    if (result.error) {
      return res.status(401).json({ message: result.error });
    }

    res.json({
      message: 'Token refreshed successfully',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (err) {
    console.error('REFRESH TOKEN ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
