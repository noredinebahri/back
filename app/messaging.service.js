// messaging.service.js
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Ensure these environment variables are set in your .env file or environment
const EMAIL_USER = process.env.EMAIL;
const EMAIL_PASS = process.env.PASSGMAIL;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // Provided by Twilio

// Helper function to format a phone number into E.164 format.
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return phoneNumber;
  // If the number starts with "00", replace with "+"
  if (phoneNumber.startsWith('00')) {
    return '+' + phoneNumber.slice(2);
  }
  // Otherwise, assume it is already in the correct format
  return phoneNumber;
}

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Change if you use another service
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Configure Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Send an email message.
 */
exports.sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject,
    text
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send an SMS message.
 */
exports.sendSMS = async (to, message) => {
  try {
    const formattedTo = formatPhoneNumber(to);
    // Corrected: use "to" field instead of "formattedTo"
    const msg = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedTo
    });
    console.log('SMS sent: ', msg.sid);
    return msg;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

/**
 * Send a WhatsApp message.
 */
exports.sendWhatsAppMessage = async (to, message) => {
  try {
    const formattedTo = formatPhoneNumber(to);
    const msg = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${formattedTo}`
    });
    console.log('WhatsApp message sent: ', msg.sid);
    return msg;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};
