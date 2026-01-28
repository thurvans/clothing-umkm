const express = require('express');
const router = express.Router();
const {
  createTransaction,
  handleNotification,
  getOrderById,
  getUserOrders
} = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

// Protected routes
router.post('/checkout', authMiddleware, createTransaction);
router.get('/orders', authMiddleware, getUserOrders);
router.get('/orders/:id', authMiddleware, getOrderById);

// Webhook from Midtrans (no auth required)
router.post('/notification', handleNotification);

module.exports = router;
