// transaction.service.js
const transactionRepository = require('./transaction.repository');

exports.createTransaction = async (transactionData) => {
  // Here you can add business logic, validations, etc.
  return await transactionRepository.createTransaction(transactionData);
};

exports.getAllTransactions = async () => {
  return await transactionRepository.getAllTransactions();
};

exports.getTransactionById = async (transactionId) => {
  return await transactionRepository.getTransactionById(transactionId);
};

exports.updateTransaction = async (transactionId, transactionData) => {
  return await transactionRepository.updateTransaction(transactionId, transactionData);
};

exports.deleteTransaction = async (transactionId) => {
  return await transactionRepository.deleteTransaction(transactionId);
};
