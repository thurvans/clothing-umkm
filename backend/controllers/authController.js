const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/emailService');

// Validasi email domain
const allowedEmailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

const isValidEmailDomain = (email) => {
  const domain = email.split('@')[1];
  return allowedEmailDomains.includes(domain);
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi.'
      });
    }

    // Validasi email domain
    if (!isValidEmailDomain(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email harus menggunakan domain @gmail.com, @yahoo.com, @outlook.com, atau @hotmail.com'
      });
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter.'
      });
    }

    // Check if email already exists
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, phone, verification_token, status) 
       VALUES (?, ?, ?, ?, ?, 'unverified')`,
      [name, email, hashedPassword, phone || null, verificationToken]
    );

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.',
      data: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi.'
    });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token verifikasi tidak ditemukan.'
      });
    }

    // Find user by verification token
    const [users] = await db.query(
      'SELECT id, name, email, status FROM users WHERE verification_token = ?',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token verifikasi tidak valid atau sudah digunakan.'
      });
    }

    const user = users[0];

    if (user.status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Email sudah diverifikasi sebelumnya.'
      });
    }

    // Update user status to verified
    await db.query(
      `UPDATE users SET status = 'verified', verification_token = NULL WHERE id = ?`,
      [user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Email berhasil diverifikasi! Silakan login.',
      data: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi email.'
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      });
    }

    // Find user
    const [users] = await db.query(
      'SELECT id, name, email, password, role, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    // Check if user is verified
    if (user.status === 'unverified') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda belum diverifikasi. Silakan cek email Anda.'
      });
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah diblokir. Hubungi admin untuk informasi lebih lanjut.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30m' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login.'
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi.'
      });
    }

    // Find user
    const [users] = await db.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    );

    // Always return success even if user not found (security best practice)
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Jika email terdaftar, link reset password akan dikirim ke email Anda.'
      });
    }

    const user = users[0];

    // Generate reset token (random string, 1 time use)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE id = ?',
      [resetToken, resetTokenExpire, user.id]
    );

    // Send reset email
    await sendResetPasswordEmail(email, user.name, resetToken);

    res.status(200).json({
      success: true,
      message: 'Link reset password telah dikirim ke email Anda.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan. Silakan coba lagi.'
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token dan password baru wajib diisi.'
      });
    }

    // Validasi password minimal 6 karakter
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter.'
      });
    }

    // Find user by reset token
    const [users] = await db.query(
      'SELECT id, name, reset_token_expire FROM users WHERE reset_token = ?',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token tidak valid atau sudah digunakan.'
      });
    }

    const user = users[0];

    // Check if token is expired
    if (new Date() > new Date(user.reset_token_expire)) {
      return res.status(400).json({
        success: false,
        message: 'Token sudah kadaluarsa. Silakan request reset password baru.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and remove reset token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Password berhasil direset! Silakan login dengan password baru.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat reset password.'
    });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data user.'
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser
};
