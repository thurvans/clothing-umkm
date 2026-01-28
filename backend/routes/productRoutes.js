const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductBySlug,
  getAllCategories
} = require('../controllers/productController');

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getAllCategories);
router.get('/:slug', getProductBySlug);

module.exports = router;
