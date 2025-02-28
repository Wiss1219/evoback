const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ✅ CORS Headers for Cart Routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://evofront.onrender.com'); // ✅ Allow frontend
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Get Cart
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Item to Cart
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Basic validation
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Please provide productId and quantity' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Add item to cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    // Update total price
    const products = await Product.find({ _id: { $in: cart.items.map(item => item.product) } });
    cart.total = cart.items.reduce((acc, item) => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      return acc + product.price * item.quantity;
    }, 0);

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment Item Quantity
router.put('/increment/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    // Basic validation
    if (!itemId) {
      return res.status(400).json({ message: 'Please provide itemId' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Increment item quantity
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Update total price
    const products = await Product.find({ _id: { $in: cart.items.map(item => item.product) } });
    cart.total = cart.items.reduce((acc, item) => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      return acc + product.price * item.quantity;
    }, 0);

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decrement Item Quantity
router.put('/decrement/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    // Basic validation
    if (!itemId) {
      return res.status(400).json({ message: 'Please provide itemId' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Decrement item quantity
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex > -1) {
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      } else {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Update total price
    const products = await Product.find({ _id: { $in: cart.items.map(item => item.product) } });
    cart.total = cart.items.reduce((acc, item) => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      return acc + product.price * item.quantity;
    }, 0);

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove Item from Cart
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    // Basic validation
    if (!itemId) {
      return res.status(400).json({ message: 'Please provide itemId' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove item from cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Update total price
    const products = await Product.find({ _id: { $in: cart.items.map(item => item.product) } });
    cart.total = cart.items.reduce((acc, item) => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      return acc + product.price * item.quantity;
    }, 0);

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;