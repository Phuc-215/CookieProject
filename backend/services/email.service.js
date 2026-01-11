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
      subject: 'Verify Your Cookie Account',
      html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Cookie Account</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #FFF8E1; font-family: 'Courier New', Courier, monospace;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF8E1; padding: 40px 10px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 550px; background-color: #FFFFFF; border: 4px solid #2C1810; box-shadow: 12px 12px 0px #2C1810;">
            
            <tr>
              <td style="background-color: #FFC4DD; padding: 40px 20px; text-align: center; border-bottom: 4px solid #2C1810;">
                <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #2C1810; letter-spacing: 6px; text-transform: uppercase;">
                  COOKIE
                </h1>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 50px 40px; text-align: center;">
                
                <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #2C1810; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                  Welcome to Cookie!
                </h2>
                
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #2C1810; line-height: 1.6; font-family: Arial, sans-serif;">
                  Let's get your account verified and ready to
                </p>
                
                <p style="margin: 0 0 35px 0; font-size: 16px; color: #2C1810; line-height: 1.6; font-family: Arial, sans-serif;">
                  share delicious recipes!
                </p>
                
                <div style="background-color: #FFF8E1; border: 3px solid #2C1810; padding: 40px 20px; margin-bottom: 30px; position: relative;">
                  <p style="margin: 0 0 15px 0; font-size: 13px; color: #2C1810; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">
                    YOUR VERIFICATION CODE
                  </p>
                    <div style="font-size: 42px; font-weight: bold; color: #FF1493; letter-spacing: 12px;">
                      ${code}
                    </div>
                </div>
                
                <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 35px;">
                  <tr>
                    <td style="background-color: #2C1810; padding: 10px 25px; border: 2px solid #2C1810;">
                      <p style="margin: 0; font-size: 14px; color: #FFFFFF; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                        Expires in 24 hours
                      </p>
                    </td>
                  </tr>
                </table>

                <div style="margin: 40px 0 20px 0; border-top: 4px solid #2C1810;"></div>

                <p style="margin: 0; font-size: 13px; color: #666666; font-family: Arial, sans-serif;">
                  Didn't create this account? You can safely ignore this email.
                </p>
                
              </td>
            </tr>
            
            <tr>
              <td style="background-color: #2C1810; padding: 25px 20px; text-align: center;">
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #FFF8E1; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                  © 2026 Cookie
                </p>
                <p style="margin: 0; font-size: 12px; color: #FFB4C8;">
                  Made with ❤️
                </p>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
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

exports.sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Reset Your Cookie Password',
      html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Cookie Password</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #FFF8E1; font-family: 'Courier New', Courier, monospace;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF8E1; padding: 40px 10px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 550px; background-color: #FFFFFF; border: 4px solid #2C1810; box-shadow: 12px 12px 0px #2C1810;">
            
            <tr>
              <td style="background-color: #FFB4C8; padding: 40px 20px; text-align: center; border-bottom: 4px solid #2C1810;">
                
                <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #2C1810; letter-spacing: 6px; text-transform: uppercase;">
                  COOKIE
                </h1>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 50px 40px; text-align: center;">
                
                <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #2C1810; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                  Password Reset Request
                </h2>
                
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #2C1810; line-height: 1.6; font-family: Arial, sans-serif;">
                  Someone (hopefully you!) requested to reset your password.
                </p>
                
                <p style="margin: 0 0 35px 0; font-size: 16px; color: #2C1810; line-height: 1.6; font-family: Arial, sans-serif;">
                  Use the code below to create a new password:
                </p>
                
                <div style="background-color: #FFF8E1; border: 3px solid #2C1810; padding: 40px 20px; margin-bottom: 30px; position: relative;">
                  <p style="margin: 0 0 15px 0; font-size: 13px; color: #2C1810; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">
                    YOUR RESET CODE
                  </p>
                    <div style="font-size: 42px; font-weight: bold; color: #FF1493; letter-spacing: 12px;">
                      ${resetCode}
                    </div>
                </div>
                
                <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 35px;">
                  <tr>
                    <td style="background-color: #2C1810; padding: 10px 25px; border: 2px solid #2C1810;">
                      <p style="margin: 0; font-size: 14px; color: #FFFFFF; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                        Expires in 15 minutes
                      </p>
                    </td>
                  </tr>
                </table>

                <div style="background-color: #FFF3CD; border: 3px solid #F59E0B; padding: 20px; text-align: left;">
                  <p style="margin: 0 0 5px 0; font-size: 14px; color: #78350F; font-weight: bold; text-transform: uppercase;">
                    ⚠ Security Alert
                  </p>
                  <p style="margin: 0; font-size: 13px; color: #92400E; line-height: 1.5; font-family: Arial, sans-serif;">
                    If you didn't request this, please ignore this email and secure your account immediately.
                  </p>
                </div>

                <div style="margin: 40px 0 20px 0; border-top: 4px solid #2C1810;"></div>

                <p style="margin: 0; font-size: 13px; color: #666666; font-family: Arial, sans-serif;">
                  Need help? Contact our support team.
                </p>
                
              </td>
            </tr>
            
            <tr>
              <td style="background-color: #2C1810; padding: 25px 20px; text-align: center;">
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #FFF8E1; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                  © 2026 Cookie
                </p>
                <p style="margin: 0; font-size: 12px; color: #FFB4C8;">
                  Made with ❤️
                </p>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
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
