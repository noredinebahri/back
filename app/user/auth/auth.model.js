const sequelize = require("../../../params/db");
const { DataTypes, Model, Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");

class Customers extends Model {
  async validPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }
}

Customers.init(
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3), // USD, EUR, etc.
      allowNull: false,
      defaultValue: "USD",
    },
    language: {
      type: DataTypes.STRING(10), // fr, en, ar...
      allowNull: false,
      defaultValue: "en",
    },
    user_type: {
      type: DataTypes.ENUM("CUSTOMER", "ADMIN", "DRIVER", "MERCHANT", "AGENT", "GUEST", "SUPER_ADMIN", "MANAGER", "EMPLOYEE"),
      defaultValue: "CUSTOMER",
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Customers",
    tableName: "customers",
    hooks: {
      beforeCreate: async (user) => {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      },
    },
  }
);

module.exports = Customers;