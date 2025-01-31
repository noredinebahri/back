const bookingRoute = require('express').Router();
const bookingCtrl = require('./booking.ctrl');
const authMiddleware = require("../user/middleware/authMiddleware");

// Nouvelle route pour récupérer les aéroports
bookingRoute.get('/airports', authMiddleware,bookingCtrl.getMoroccanAirports);

// Nouvelle route pour récupérer les villes d'un aéroport
bookingRoute.get('/cities/:airportId',authMiddleware, bookingCtrl.getCitiesByAirport);

// Nouvelle route pour récupérer les lieux dans une ville
bookingRoute.get('/cities', authMiddleware,bookingCtrl.getPlacesByCity);
bookingRoute.post('/calculate', authMiddleware,bookingCtrl.calculatePrice);
// bookingRoute.post('/flight', bookingCtrl.getFlightByIataAndNumber);
bookingRoute.post('/generate', authMiddleware,bookingCtrl.generate);
// checkout session stripe
bookingRoute.post('/create-checkout-session',bookingCtrl.checkoutSession);

bookingRoute.get('/session-status', authMiddleware,bookingCtrl.sessionStatus);
bookingRoute.post('/convertCurrency', authMiddleware,bookingCtrl.convertCurrency);
module.exports = bookingRoute;
