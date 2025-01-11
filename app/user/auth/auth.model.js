const { Sequelize } = require("sequelize");
const db = require("../../../params/db");

const User = db.define(
    "user",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        firstname: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        lastname: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        emailsec: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        role: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        
        phone: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        private_token: {
            type: Sequelize.STRING(1500),
            allowNull: true,
        },
        actif: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        rejected: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0,
        },
        function: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'prof'
        },
        priceHour: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0,
        },
        priceMonth: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        }
    },
    {
        charset: "utf8",
        collate: "utf8_general_ci",
    }
);

module.exports = User;