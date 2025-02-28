const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from headers or query
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
      return res.status(401).json({ message: 'No auth token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is invalid' });
  }
};

module.exports = auth;