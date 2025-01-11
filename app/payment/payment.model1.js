/** @format */

const { Sequelize } = require("sequelize");
const db = require("../../params/db");

const Payment = db.define(
  "payments",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    paymentDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    rest: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    rejected: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    charset: "utf8",
    collate: "utf8_general_ci",
  }
);

module.exports = Payment;
