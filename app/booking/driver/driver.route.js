// driver.route.js
const express = require('express');
const router = express.Router();
const driverController = require('./driver.controller');
const authMiddleware = require('../../user/middleware/authMiddleware'); // Secure the endpoint if needed

// POST endpoint to assign a driver after successful payment
router.post('/assign-driver', authMiddleware, driverController.assignDriver);
router.post('/accept', authMiddleware, driverController.acceptRide);
// router.post('/ride/accept', authMiddleware, driverController.acceptedRide);

router.get('/info', driverController.getDriverInfo);

// Endpoint to retrieve rides assigned to the driver
router.get('/rides/:driver_id', driverController.getDriverRides);


module.exports = router;
