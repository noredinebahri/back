const sequelize = require('../../../params/db')
const jwt = require('jsonwebtoken');

exports.withDatabaseConnection = async(req, res, next) => {
  
        const transaction = await sequelize.transaction();
      
        try {
          req.transaction = transaction;
          await next();
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          console.error("Transaction rolled back:", error);
          res.status(500).json({ message: "Internal server error" });
        }
}  
exports.authenticateToken = (req, res, next) => {

    next();
};
exports.checkRole =  (role) => {
        return (req, res, next) => {
          const user = req.user; // Assuming user is set in a middleware that decodes the JWT
          if (user && user.role === role) {
            next();
          } else {
            res.status(403).json({ message: "Permission denied" });
          }
        };
      }