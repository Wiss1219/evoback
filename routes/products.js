const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ✅ CORS Headers for Products Routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://evofront.onrender.com'); // ✅ Allow frontend
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Get All Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error during fetching products' });
  }
});

// Get Product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error during fetching product' });
  }
});

module.exports = router;