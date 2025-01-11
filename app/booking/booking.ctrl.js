const bookingService = require('./booking.service');

async function getRideBooking(req, res) {
    try {
        const rides = await bookingService.getAllRides();
        res.status(200).json({payload: rides, sucess: true});
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve rides.', success: false }); // Send a 500 error
    }
}
async function createRideBooking(req, res) {
     try {
       const newRide = req.body; 
       const bookingId = await bookingService.addRide(newRide);
       res.status(201).json({ message: 'Ride booking created successfully', bookingId });
     } catch (error) {
       console.error('Error in booking controller:', error);
       res.status(500).json({ error: error.message || 'Failed to create ride booking.' });
     }
   }
   
module.exports = { getRideBooking, createRideBooking };