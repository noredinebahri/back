const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../params/db');  // Chemin vers ta connexion DB

class Airport extends Model {}

Airport.init({
  airport_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  airport_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  airport_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  is_international: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Airport',
  tableName: 'airports'
});

module.exports = Airport;
