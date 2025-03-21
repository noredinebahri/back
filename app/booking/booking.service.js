const bookingRepository = require('./booking.repository');
const { spawn } = require('child_process');
const path = require('path');
async function getAllRides() {
    try {
        const rides = await bookingRepository.getAllRidesFromDb();
        return rides; // Return the rides data
    } catch (error) {
        console.error('Error in booking service:', error);
        // Optionally, you can transform the error here into a more user-friendly message
        throw new Error('Failed to retrieve rides.'); // Re-throw a generic error
    }
}
async function getActiveRideByUserId(userId) {
  return await RideBooking.findOne({
      where: {
          user_id: userId,
          booking_status: 'PENDING' // ou tout autre statut que vous considérez comme actif
      }
  });
}
async function addRide(newRide) {
     try {
       const bookingId = await bookingRepository.createRideBooking(newRide);
       return bookingId;
     } catch (error) {
       console.error('Error in booking service:', error);
       throw new Error('Failed to create ride booking.');
     }
   }
   async function calculateRide(from, to) {
    try {
      const infoCalcule = await bookingRepository.calculateDistance2(from, to);
      return infoCalcule;
    } catch (error) {
      
    }
   }
   function generateResponse(prompt) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [path.join(__dirname, 'gpt_integration.py'), prompt]);
  
      pythonProcess.stdout.on('data', (data) => {
        resolve(data.toString());
      });
  
      pythonProcess.stderr.on('data', (data) => {
        reject(`Erreur : ${data}`);
      });
    });
  }
module.exports = { getAllRides, addRide, getActiveRideByUserId, calculateRide, generateResponse };