// notification.service.js
const nodemailer = require('nodemailer');

// Configuration du transporteur (ici avec Gmail, à adapter selon vos besoins)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL, // Votre email
    pass: process.env.PASSGMAIL  // Votre mot de passe ou token
  }
});

/**
 * Envoie un email au client pour lui notifier que le chauffeur est arrivé.
 * @param {string} clientEmail - L’email du client
 * @param {Object} driverInfo - Les informations du chauffeur (nom, etc.)
 */
async function sendArrivalEmail(clientEmail, driverInfo) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'Votre chauffeur est arrivé',
    text: `Bonjour, Votre chauffeur ${driverInfo.full_name} est arrivé à votre point de départ. Contact: ${driverInfo.phone_number} Bonne course !` };
     return transporter.sendMail(mailOptions);
    }
    
    module.exports = { sendArrivalEmail };
    
    