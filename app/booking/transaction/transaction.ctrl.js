// transaction.controller.js
const transactionService = require('./transaction.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const driverService = require('../driver/driver.service');
const { Airport } = require('../booking.model');
const { io } = require("../../../server"); // Importer l'instance Socket.IO

exports.createTransaction = async (req, res) => {
  try {
    const transactionData = req.body;
    const newTransaction = await transactionService.createTransaction(transactionData);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions();
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.completeTransaction = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // 1. Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment has not been completed' });
    }

    const {
      user_id,
      amount,
      currency,
      fromAirport,
      toCity,
      booking_id
    } = session.metadata;

    if (!user_id || !amount || !currency || !fromAirport || !toCity) {
      return res.status(400).json({ error: 'Missing required metadata from Stripe session' });
    }

    const transactionData = {
      transaction_id: session.id, // using the Stripe session ID as the transaction ID
      user_id,
      booking_id: booking_id || null,
      amount: parseFloat(amount),
      currency,
      city_id: toCity,
      airport_id: fromAirport,
      payment_method: session.payment_method_types[0]?.toUpperCase() || 'UNKNOWN',
      payment_status: 'SUCCESSFUL',
      transaction_date: new Date()
    };

    // 3. Save the transaction record in the SQL table
    const transaction = await transactionService.createTransaction(transactionData);


    const assignmentData = {
      fromAirport,
      toCity,
      price: amount, // you may adjust this if needed (e.g., price conversion)
      link: `${process.env.DRIVER_APP_URL || 'http://localhost:4200/driver'}?transactionId=${transaction.transaction_id}`
    };

    const driver = await driverService.assignDriverAndNotify(assignmentData);

    // Une fois le chauffeur assigné, notifier le client avec les informations du chauffeur
    io.to(user_id).emit('driver_status', {
      message: 'Votre chauffeur a accepté la course.',
      driver
    });

    // 5. Return the transaction and assigned driver details
    res.status(200).json({ transaction, driver });
  } catch (error) {
    console.error('Error in completeTransaction endpoint:'+error, error);
    res.status(500).json({ error: error.message });
  }
};
exports.getTransactionById = async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    const transaction = await transactionService.getTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    const transactionData = req.body;
    const updatedTransaction = await transactionService.updateTransaction(transactionId, transactionData);
    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    const deleted = await transactionService.deleteTransaction(transactionId);
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: error.message });
  }
};
