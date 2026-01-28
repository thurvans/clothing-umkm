const express = require('express');
const router = express.Router();
const {
  getProvinces,
  getCities,
  calculateShippingCost
} = require('../controllers/shippingController');

// Public routes (bisa diakses tanpa login untuk cek ongkir)
router.get('/provinces', getProvinces);
router.get('/cities', getCities);
router.post('/cost', calculateShippingCost);

module.exports = router;
