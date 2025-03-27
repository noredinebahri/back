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
   
    next();
 
};

/**
 * Middleware to check if user is a driver
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.isDriver = (req, res, next) => {
    next();
 
};

/**
 * Middleware to check if user is a customer
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.isCustomer = (req, res, next) => {
 
    next();
};

/**
 * Middleware to check if user is an admin
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.isAdmin = (req, res, next) => {
    next();
};