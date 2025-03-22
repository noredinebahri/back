// routes/taxiRoutes.js

const express = require('express');
const router = express.Router();
const taxiController = require('./taxiController');
const authMiddleware = require('./authMiddleware');

/**
 * @route   POST /api/taxi/booking
 * @desc    Create a new taxi booking from point A to point B
 * @access  Private
 */
router.post('/booking', authMiddleware.verifyToken, taxiController.createBooking);

/**
 * @route   GET /api/taxi/booking/:id
 * @desc    Get booking details by ID
 * @access  Private
 */
router.get('/booking/:id', authMiddleware.verifyToken, taxiController.getBookingById);

/**
 * @route   GET /api/taxi/bookings
 * @desc    Get all bookings for the current user
 * @access  Private
 */
router.get('/bookings', authMiddleware.verifyToken, taxiController.getUserBookings);

/**
 * @route   POST /api/taxi/vehicle
 * @desc    Register a new vehicle
 * @access  Private (Driver only)
 */
router.post('/vehicle', 
    [authMiddleware.verifyToken, authMiddleware.isDriver], 
    taxiController.registerVehicle);

/**
 * @route   GET /api/taxi/vehicles
 * @desc    Get all vehicles for a driver
 * @access  Private (Driver only)
 */
router.get('/vehicles', 
    [authMiddleware.verifyToken, authMiddleware.isDriver], 
    taxiController.getDriverVehicles);

/**
 * @route   PUT /api/taxi/booking/:id/status
 * @desc    Update booking status (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
 * @access  Private
 */
router.put('/booking/:id/status', 
    authMiddleware.verifyToken, 
    taxiController.updateBookingStatus);

/**
 * @route   GET /api/taxi/available-drivers
 * @desc    Get available drivers near a location
 * @access  Private
 */
router.get('/available-drivers', 
    authMiddleware.verifyToken, 
    taxiController.getAvailableDrivers);

/**
 * @route   POST /api/taxi/rating
 * @desc    Rate a driver after a completed ride
 * @access  Private
 */
router.post('/rating', 
    authMiddleware.verifyToken, 
    taxiController.rateDriver);

/**
 * @route   GET /api/taxi/estimate
 * @desc    Get fare estimate for a ride
 * @access  Private
 */
router.get('/estimate', 
    authMiddleware.verifyToken, 
    taxiController.estimateFare);
/**
 * @route POST /api/v1/taxi/addTestDrivers
 * @desc Add test drivers to DB
 * @access Admin
 **/
router.post('/addTestDrivers', authMiddleware.verifyToken, taxiController.addTestDrivers);

module.exports = router;