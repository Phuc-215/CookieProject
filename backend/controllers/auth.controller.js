const authService = require('../services/auth.service');

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
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

    // Return user info WITHOUT tokens - must verify email first
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: result.user
    });

  } catch (err) {
    console.error(err);

    // fallback n?u DB unique constraint b?n l?i
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
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        return res.status(403).json({ message: 'Please verify your email before logging in' });
      }
      return res.status(401).json({ message: 'Invalid email or password' });
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

    // Return tokens after successful verification
    res.json({ 
      message: 'Email verified successfully',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const result = await authService.resendVerificationCode(email);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ message: 'Verification code sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);

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

exports.requestPasswordReset = async (req, res) => {
  try {
    await authService.requestPasswordReset(req.body.email);

    // Always return success to avoid revealing if email exists
    res.json({ message: 'If this email is registered, you will receive a password reset code' });
  } catch (err) {
    console.error('REQUEST PASSWORD RESET ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyResetCode = async (req, res) => {
  try {
    const result = await authService.verifyResetCode(req.body.code);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ message: 'Reset code verified', code: result.code });
  } catch (err) {
    console.error('VERIFY RESET CODE ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body.code, req.body.newPassword);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'PASSWORD_REQUIRED' });
    }

    const userId = req.user.id;
    const result = await authService.verifyPassword(userId, password);

    if (result.error) {
      return res.status(401).json({ message: result.error });
    }

    res.json({ message: 'Password verified', valid: true });
  } catch (err) {
    console.error('VERIFY PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'CURRENT_AND_NEW_PASSWORD_REQUIRED' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'PASSWORD_TOO_SHORT' });
    }

    const userId = req.user.id;
    const result = await authService.changePassword(userId, currentPassword, newPassword);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('CHANGE PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
