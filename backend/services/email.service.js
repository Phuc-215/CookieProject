const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service not configured:', error.message);
  } else {
    console.log('Email service ready');
  }
});

exports.sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Email Verification - Cookie App',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #8B4513; margin: 0; font-size: 28px; }
              .content { text-align: center; }
              .content p { color: #333; font-size: 16px; line-height: 1.6; }
              .code-box { background: #f0f0f0; border: 2px solid #8B4513; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .code { font-size: 40px; font-weight: bold; color: #8B4513; letter-spacing: 10px; font-family: monospace; }
              .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              .warning { color: #d9534f; font-size: 12px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍪 Cookie</h1>
              </div>
              <div class="content">
                <p>Welcome to Cookie!</p>
                <p>Please verify your email address to complete your registration.</p>
                <div class="code-box">
                  <p style="margin: 0 0 10px 0; color: #666;">Your verification code:</p>
                  <div class="code">${code}</div>
                </div>
                <p>This code will expire in <strong>24 hours</strong>.</p>
                <div class="warning">
                  If you did not create this account, please ignore this email.
                </div>
              </div>
              <div class="footer">
                <p>© 2026 Cookie App. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error.message);
    return { error: error.message };
  }
};

exports.sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset - Cookie App',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #8B4513; margin: 0; font-size: 28px; }
              .content { text-align: center; }
              .content p { color: #333; font-size: 16px; line-height: 1.6; }
              .button { display: inline-block; background: #8B4513; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; font-weight: bold; }
              .button:hover { background: #6b3410; }
              .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              .warning { color: #d9534f; font-size: 12px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍪 Cookie  </h1>
              </div>
              <div class="content">
                <p>Hi there! </p>
                <p>We received a request to reset your password. Click the button below to set a new password.</p>
                <a href="${resetLink}" class="button">Reset Password</a>
                <p style="color: #999; font-size: 12px;">This link will expire in 15 minutes.</p>
                <div class="warning">
                  If you did not request a password reset, please ignore this email.
                </div>
              </div>
              <div class="footer">
                <p>© 2026 Cookie App. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.response);
    return { success: true };
  } catch (error) {
    console.error('Password reset email error:', error.message);
    return { error: error.message };
  }
};
