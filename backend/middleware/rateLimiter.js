const rateLimit = require('express-rate-limit');
const db = require('../config/database');

// Rate limiter untuk register
const registerLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 jam
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 3, // max 3 register per jam
  message: {
    success: false,
    message: 'Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Store attempt in database
  handler: async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    
    try {
      await db.query(
        'INSERT INTO register_attempts (ip_address, email) VALUES (?, ?)',
        [ip, req.body.email || null]
      );
    } catch (error) {
      console.error('Error logging register attempt:', error);
    }

    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan registrasi dari IP ini. Silakan coba lagi dalam 1 jam.'
    });
  }
});

// Rate limiter untuk login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // max 5 login attempts
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter untuk forgot password
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3, // max 3 requests per jam
  message: {
    success: false,
    message: 'Terlalu banyak permintaan reset password. Silakan coba lagi nanti.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Cleanup old register attempts (jalankan setiap hari)
const cleanupOldAttempts = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.query(
      'DELETE FROM register_attempts WHERE attempt_time < ?',
      [oneDayAgo]
    );
    console.log('✅ Old register attempts cleaned up');
  } catch (error) {
    console.error('Error cleaning up register attempts:', error);
  }
};

// Run cleanup every 24 hours
setInterval(cleanupOldAttempts, 24 * 60 * 60 * 1000);

module.exports = {
  registerLimiter,
  loginLimiter,
  forgotPasswordLimiter
};
