const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// ✅ CORS Headers for Orders Routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://evofront.onrender.com'); // ✅ Allow frontend
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Create Order
router.post('/', async (req, res) => {
  try {
    const { items, shippingDetails } = req.body;

    // Basic validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    // Calculate total price
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Create new order
    const order = new Order({
      user: req.user.id,
      items,
      total,
      shippingDetails
    });
    await order.save();

    // Clear cart
    await Cart.findOneAndDelete({ user: req.user.id });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error during order creation' });
  }
});

// Get Orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product');
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error during fetching orders' });
  }
});

module.exports = router;