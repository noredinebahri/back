// transaction.route.js
const express = require('express');
const router = express.Router();
const transactionController = require('./transaction.ctrl');
const authMiddleware = require('../../user/middleware/authMiddleware'); // Adjust the path as needed

// Define transaction endpoints
router.post('/', authMiddleware, transactionController.createTransaction);
router.get('/', authMiddleware, transactionController.getAllTransactions);
router.post('/complete', authMiddleware, transactionController.completeTransaction);
router.get('/:transactionId', authMiddleware, transactionController.getTransactionById);
router.put('/:transactionId', authMiddleware, transactionController.updateTransaction);
router.delete('/:transactionId', authMiddleware, transactionController.deleteTransaction);

module.exports = router;
