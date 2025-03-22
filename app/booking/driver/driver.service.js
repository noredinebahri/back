// driver.service.js
const driverRepository = require('./driver.repository');
const messagingService = require('../../messaging.service');
const { Transaction, Driver } = require('../booking.model');
exports.acceptRide = async (transactionId, driver_id) => {
  try {
    // Récupérer la transaction
    const transaction = await Transaction.findOne({ where: { transaction_id: transactionId } });
    if (!transaction) {
      throw new Error('Transaction non trouvée');
    }
    // Mettre à jour le statut de la transaction et assigner le driver
    transaction.payment_status = 'SUCCESSFUL'; // Par exemple
    transaction.driver_id = driver_id;
    await transaction.save();
    // Récupérer les informations du driver
    const driver = await Driver.findOne({ where: { driver_id } });
    transaction.driver = driver; // Attacher les infos du conducteur pour renvoyer la réponse
    return transaction;
  } catch (error) {
    console.error('Error in driverService.acceptRide:', error);
    throw error;
  }
};
/**
 * Assign an available driver and notify him/her via email, SMS, and WhatsApp.
 * @param {Object} assignmentData - Contains fromAirport, toCity, price, link, transactionId
 * @returns {Object} The assigned driver details.
 */
exports.assignDriverAndNotify = async (assignmentData) => {
  try {
    // Find an available driver
    const driver = await driverRepository.getAvailableDriver();
    if (!driver) {
      throw new Error('No available driver found');
    }

    // Optionally mark the driver as not available
    // await driverRepository.updateDriverAvailability(driver.driver_id, false);

    // Build the message content
    const { fromAirport, toCity, price, link } = assignmentData;
    const messageText = `New Ride Request:
From: ${fromAirport}
To: ${toCity}
Price: ${price}
Accept the ride: ${link}`;

    // Send notifications (email, SMS, and WhatsApp)
    await messagingService.sendEmail(driver.email, 'New Ride Request', messageText);
    // await messagingService.sendSMS(driver.phone_number, messageText);
    // await messagingService.sendWhatsAppMessage(driver.phone_number, messageText);
    return driver;
  } catch (error) {
    console.error('Error in assignDriverAndNotify:', error);
    throw error;
  }
};

exports.getDriverInfo = async (driverId) => {
  try {
    return await driverRepository.findDriverById(driverId);
  } catch (error) {
    console.error('Error in driverService.getDriverInfo:', error);
    throw error;
  }
};

exports.getDriverRides = async (driverId) => {
  try {
    return await driverRepository.findRidesByDriver(driverId);
  } catch (error) {
    console.error('Error in driverService.getDriverRides:', error);
    throw error;
  }
};
