const bookingRoute = require("express").Router();
const bookingCtrl = require("./booking.ctrl");
const bookingmdllw = require("./booking.middlware");
bookingRoute.get('/rides', bookingCtrl.getRideBooking);
bookingRoute.post('/ride', bookingCtrl.createRideBooking);

module.exports = bookingRoute;