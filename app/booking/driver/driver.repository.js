// driver.repository.js
const {Driver, Transaction} = require('../booking.model');

exports.getAvailableDriver = async () => {
  try {
    // Retrieve the first driver who is marked as available.
    const driver = await Driver.findOne({ where: { is_available: 1 } });
    return driver;
  } catch (error) {
    console.error('Error in getAvailableDriver:', error);
    throw error;
  }
};

exports.updateDriverAvailability = async (driver_id, availability) => {
  try {
    const driver = await Driver.findOne({ where: { driver_id } });
    if (!driver) return null;
    driver.is_available = availability;
    await driver.save();
    return driver;
  } catch (error) {
    console.error('Error updating driver availability:', error);
    throw error;
  }
};
exports.findDriverById = async (driverId) => {
     try {
       const driver = await Driver.findOne({ where: { driver_id: driverId } });
       return driver;
     } catch (error) {
       console.error('Error in findDriverById repository:', error);
       throw error;
     }
   };
   
   // Find rides assigned to the driver
   exports.findRidesByDriver = async (driverId) => {
     try {
       const rides = await Transaction.findAll({
         where: { driver_id: driverId }
       });
       return rides;
     } catch (error) {
       console.error('Error in findRidesByDriver repository:', error);
       throw error;
     }
   };
