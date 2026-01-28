const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const {
  registerLimiter,
  loginLimiter,
  forgotPasswordLimiter
} = require('../middleware/rateLimiter');

// Public routes
router.post('/register', registerLimiter, register);
router.get('/verify-email', verifyEmail);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
