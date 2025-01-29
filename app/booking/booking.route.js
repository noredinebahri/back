const bookingRoute = require('express').Router();
const bookingCtrl = require('./booking.ctrl');

// Nouvelle route pour récupérer les aéroports
bookingRoute.get('/airports', bookingCtrl.getMoroccanAirports);

// Nouvelle route pour récupérer les villes d'un aéroport
bookingRoute.get('/cities/:airportId', bookingCtrl.getCitiesByAirport);

// Nouvelle route pour récupérer les lieux dans une ville
bookingRoute.get('/cities', bookingCtrl.getPlacesByCity);
bookingRoute.post('/calculate', bookingCtrl.calculatePrice);
// bookingRoute.post('/flight', bookingCtrl.getFlightByIataAndNumber);
bookingRoute.post('/generate', bookingCtrl.generate);
// checkout session stripe
bookingRoute.post('/create-checkout-session', bookingCtrl.checkoutSession);

bookingRoute.get('/session-status', bookingCtrl.sessionStatus);
bookingRoute.post('/convertCurrency', bookingCtrl.convertCurrency);
module.exports = bookingRoute;
