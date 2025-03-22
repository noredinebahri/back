// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const { User } = require('../booking/booking.model');

/**
 * Middleware to verify JWT token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findByPk(decoded.user_id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request object
    req.user = {
      user_id: user.user_id,
      email: user.email,
      user_type: user.user_type
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Middleware to check if user is a driver
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.isDriver = (req, res, next) => {
  if (req.user && req.user.user_type === 'DRIVER') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Driver role required' });
  }
};

/**
 * Middleware to check if user is a customer
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.isCustomer = (req, res, next) => {
  if (req.user && req.user.user_type === 'CUSTOMER') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Customer role required' });
  }
};

/**
 * Middleware to check if user is an admin
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.user_type === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required' });
  }
};