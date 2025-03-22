// booking.route.js
const express = require('express');
const bookingRoute = express.Router();
const bookingCtrl = require('./booking.ctrl');
// Correction ici: vous importez authMiddleware comme une fonction, mais l'utilisez comme un objet
const authMiddleware = require("../user/middleware/authMiddleware");
const pickupController = require('./pickupController');

// Routes with authentication when needed
bookingRoute.get('/airports', authMiddleware, bookingCtrl.getMoroccanAirports);
bookingRoute.get('/cities/:airportId', authMiddleware, bookingCtrl.getCitiesByAirport);
bookingRoute.get('/cities', authMiddleware, bookingCtrl.getPlacesByCity);
bookingRoute.post('/calculate', authMiddleware, bookingCtrl.calculatePrice);
bookingRoute.post('/generateBooking', authMiddleware, bookingCtrl.generate);
// Checkout session (public route so no auth here, adjust if needed)
bookingRoute.post('/create-checkout-session', bookingCtrl.checkoutSession);
bookingRoute.get('/session-status', authMiddleware, bookingCtrl.sessionStatus);
bookingRoute.post('/convertCurrency', authMiddleware, bookingCtrl.convertCurrency);


// Correction de la partie problématique:
/**
 * @route   POST /api/pickup/:booking_id
 * @desc    Ajouter un point de ramassage à une réservation
 * @access  Private
 */
bookingRoute.post('/:booking_id', authMiddleware, pickupController.addPickupPoint);

/**
 * @route   GET /api/pickup/:booking_id
 * @desc    Récupérer tous les points de ramassage d'une réservation
 * @access  Private
 */
bookingRoute.get('/:booking_id', authMiddleware, pickupController.getBookingPickupPoints);

/**
 * @route   PUT /api/pickup/:booking_id/:pickup_point_id
 * @desc    Mettre à jour le statut d'un point de ramassage
 * @access  Private (Driver only)
 */
bookingRoute.put('/:booking_id/:pickup_point_id', authMiddleware, pickupController.updatePickupStatus);

/**
 * @route   DELETE /api/pickup/:booking_id/:pickup_point_id
 * @desc    Supprimer un point de ramassage
 * @access  Private
 */
bookingRoute.delete('/:booking_id/:pickup_point_id', authMiddleware, pickupController.deletePickupPoint);

/**
 * @route   POST /api/pickup/pricing/rules
 * @desc    Définir les règles de tarification pour un chauffeur
 * @access  Private (Driver only)
 */
// Soit adapter cette partie selon la structure de votre middleware d'authentification
bookingRoute.post('/pricing/rules', authMiddleware, pickupController.setDriverPricingRules);

/**
 * @route   GET /api/pickup/pricing/rules/:driver_id?
 * @desc    Récupérer les règles de tarification d'un chauffeur
 * @access  Private
 */
bookingRoute.get('/pricing/rules/:driver_id?', authMiddleware, pickupController.getDriverPricingRules);

module.exports = bookingRoute;