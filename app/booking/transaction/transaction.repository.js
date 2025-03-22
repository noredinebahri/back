// transaction.repository.js
const {Transaction} = require('../booking.model');
const Customers = require('../../user/auth/auth.model');
const {Driver} = require('../booking.model');
exports.createTransaction = async (transactionData) => {
     try {
          let transaction = await Transaction.findOne({ 
               where: { transaction_id: transactionData.transaction_id } 
             });
             if (transaction) {
               // If the transaction already exists, return it.
               console.log('Transaction already exists, returning existing record.');
               return transaction;
             }
          // Check if the user_id exists
          const user = await Customers.findOne({ where: { user_id: transactionData.user_id } });
          if (!user) {
            throw new Error('User not found');
          }
      
          // Optionally, check if driver_id exists if it is provided in transactionData
          transactionData.driver_id =  "4a3179b6-f7d9-4aae-9bf1-b3c99a34d255";
          if (transactionData.driver_id) {
            const driver = await Driver.findOne({ where: { driver_id: transactionData.driver_id } });
            if (!driver) {
              throw new Error('Driver not found');
            }
          }
      
          // Create the transaction once all checks pass
          console.log(transactionData);
          const payload = {
            
          }
          const transactions = await Transaction.create(transactionData);
          return transactions;
        } catch (error) {
          console.error('Error in createTransaction repository:', error);
          throw error;
        }
};

exports.getAllTransactions = async () => {
  try {
    return await Transaction.findAll();
  } catch (error) {
    console.error('Error in getAllTransactions repository:', error);
    throw error;
  }
};

exports.getTransactionById = async (transactionId) => {
  try {
    return await Transaction.findOne({ where: { transaction_id: transactionId } });
  } catch (error) {
    console.error('Error in getTransactionById repository:', error);
    throw error;
  }
};

exports.updateTransaction = async (transactionId, transactionData) => {
  try {
    const transaction = await Transaction.findOne({ where: { transaction_id: transactionId } });
    if (!transaction) return null;
    await transaction.update(transactionData);
    return transaction;
  } catch (error) {
    console.error('Error in updateTransaction repository:', error);
    throw error;
  }
};

exports.deleteTransaction = async (transactionId) => {
  try {
    const transaction = await Transaction.findOne({ where: { transaction_id: transactionId } });
    if (!transaction) return null;
    await transaction.destroy();
    return true;
  } catch (error) {
    console.error('Error in deleteTransaction repository:', error);
    throw error;
  }
};
