require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Middleware
app.use(express.json());

// ✅ Correct CORS Configuration
const corsOptions = {
  origin: 'https://evofront.onrender.com', // ✅ Allow only your frontend
  methods: 'GET, POST, PUT, DELETE, OPTIONS', // ✅ Ensure preflight requests are handled
  allowedHeaders: ['Content-Type', 'Authorization'], // ✅ Allow specific headers
  credentials: true // ✅ Allow cookies and authorization headers
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Handle preflight requests

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Use app.js
const appInstance = require('./app');
app.use(appInstance);

// Root endpoint to check if backend is running
app.get('/', (req, res) => {
  res.send("✅ API is running...");
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: '❌ API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '❌ Server error' });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));