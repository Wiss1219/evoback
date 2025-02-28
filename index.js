require('dotenv').config();

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Serve static files only in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the correct frontend dist folder
  const distPath = path.join(__dirname, '../frontend/client/dist');
  app.use(express.static(distPath));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, err => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
} else {
  // Handle 404 for API routes in development
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
