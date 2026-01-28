const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Service Error:', error);
  } else {
    console.log('✅ Email Service Ready');
  }
});

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"UMKM Clothing" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verifikasi Email Anda - UMKM Clothing',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { 
            display: inline-block; 
            background: #4F46E5; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UMKM Clothing</h1>
          </div>
          <div class="content">
            <h2>Halo, ${name}!</h2>
            <p>Terima kasih telah mendaftar di UMKM Clothing.</p>
            <p>Silakan klik tombol di bawah ini untuk memverifikasi email Anda:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verifikasi Email</a>
            </div>
            <p>Atau copy dan paste link berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
            <p><strong>Link ini akan kadaluarsa dalam 24 jam.</strong></p>
            <p>Jika Anda tidak mendaftar di website kami, abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 UMKM Clothing. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send reset password email
const sendResetPasswordEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"UMKM Clothing" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Reset Password - UMKM Clothing',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { 
            display: inline-block; 
            background: #4F46E5; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UMKM Clothing</h1>
          </div>
          <div class="content">
            <h2>Halo, ${name}!</h2>
            <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
            <p>Silakan klik tombol di bawah ini untuk mereset password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Atau copy dan paste link berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Penting:</strong>
              <ul>
                <li>Link ini hanya berlaku selama 1 jam</li>
                <li>Link hanya dapat digunakan satu kali</li>
                <li>Jangan bagikan link ini kepada siapapun</li>
              </ul>
            </div>
            <p>Jika Anda tidak meminta reset password, abaikan email ini dan password Anda akan tetap aman.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 UMKM Clothing. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending reset password email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail
};
