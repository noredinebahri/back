const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require("../../params/db");


// Users Model
class User extends Model {}
User.init({
  user_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      is: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/
    }
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      is: /^\+?[1-9][0-9]{7,14}$/
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  user_type: {
    type: DataTypes.ENUM('CUSTOMER', 'DRIVER', 'ADMIN'),
    defaultValue: 'CUSTOMER',
    allowNull: false
  },
  profile_image_url: {
    type: DataTypes.STRING(500)
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  last_login: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});

// Airports Model
class Airport extends Model {}
Airport.init({
  airport_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  airport_name: {
    type: DataTypes.STRING(255),
    defaultValue: "null",
    allowNull: true
  },
  airport_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: "nulls",

    unique: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: "null"

  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: "null"

  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8)
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8)
  },
  timezone: {
    type: DataTypes.STRING(50)
  },
  is_international: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Airport',
  tableName: 'Airports'
});

// Vehicles Model
class Vehicle extends Model {}
Vehicle.init({
  vehicle_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  driver_id: {
    type: DataTypes.STRING(255),
    references: {
      model: User,
      key: 'user_id'
    }
  },
  make: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1990,
      max: new Date().getFullYear()
    }
  },
  license_plate: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  vehicle_type: {
    type: DataTypes.ENUM('SEDAN', 'SUV', 'LUXURY', 'MINIVAN'),
    allowNull: false
  },
  passenger_capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Vehicle',
  tableName: 'Vehicles'
});

// Ride Bookings Model
class RideBooking extends Model {}
RideBooking.init({
  booking_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  customer_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  driver_id: {
    type: DataTypes.STRING(255),
    references: {
      model: User,
      key: 'user_id'
    }
  },
  vehicle_id: {
    type: DataTypes.STRING(255),
    references: {
      model: Vehicle,
      key: 'vehicle_id'
    }
  },
  pickup_airport_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: Airport,
      key: 'airport_id'
    }
  },
  dropoff_airport_id: {
    type: DataTypes.STRING(255),
    references: {
      model: Airport,
      key: 'airport_id'
    }
  },
  pickup_location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  dropoff_location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  pickup_datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estimated_dropoff_datetime: {
    type: DataTypes.DATE
  },
  booking_status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  ride_type: {
    type: DataTypes.ENUM('AIRPORT_PICKUP', 'AIRPORT_DROPOFF', 'ROUND_TRIP'),
    allowNull: false
  },
  total_distance: {
    type: DataTypes.DECIMAL(10, 2)
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  payment_status: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'RideBooking',
  tableName: 'Ride_Bookings',
  validate: {
    pickupBeforeDropoff() {
      if (this.pickup_datetime >= this.estimated_dropoff_datetime) {
        throw new Error('Pickup datetime must be before dropoff datetime');
      }
    }
  },
  indexes: [
    { fields: ['customer_id'] },
    { fields: ['driver_id'] }
  ]
});

// Payments Model
class Payment extends Model {}
Payment.init({
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  booking_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: RideBooking,
      key: 'booking_id'
    }
  },
  user_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  payment_method: {
    type: DataTypes.ENUM('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'CASH'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  payment_status: {
    type: DataTypes.ENUM('PENDING', 'SUCCESSFUL', 'FAILED'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  transaction_id: {
    type: DataTypes.STRING(255),
    unique: true
  },
  payment_datetime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Payment',
  tableName: 'Payments',
  indexes: [
    { fields: ['booking_id'] }
  ]
});

// Driver Ratings Model
class DriverRating extends Model {}
DriverRating.init({
  rating_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  booking_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: RideBooking,
      key: 'booking_id'
    }
  },
  customer_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  driver_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  review_text: {
    type: DataTypes.TEXT
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'DriverRating',
  tableName: 'Driver_Ratings',
  indexes: [
    { fields: ['driver_id'] }
  ]
});

// Pricing Rules Model
class PricingRule extends Model {}
PricingRule.init({
  pricing_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  vehicle_type: {
    type: DataTypes.ENUM('SEDAN', 'SUV', 'LUXURY', 'MINIVAN'),
    allowNull: false
  },
  base_fare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  per_mile_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  peak_hour_multiplier: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 1.0
  },
  valid_from: {
    type: DataTypes.DATE
  },
  valid_to: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'PricingRule',
  tableName: 'Pricing_Rules'
});

// Define Associations
User.hasMany(Vehicle, { foreignKey: 'driver_id', as: 'vehicles' });
Vehicle.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

User.hasMany(RideBooking, { 
  foreignKey: 'customer_id', 
  as: 'customer_bookings' 
});
User.hasMany(RideBooking, { 
  foreignKey: 'driver_id', 
  as: 'driver_bookings' 
});
RideBooking.belongsTo(User, { 
  foreignKey: 'customer_id', 
  as: 'customer' 
});
RideBooking.belongsTo(User, { 
  foreignKey: 'driver_id', 
  as: 'driver' 
});

RideBooking.belongsTo(Vehicle, { 
  foreignKey: 'vehicle_id', 
  as: 'vehicle' 
});
RideBooking.belongsTo(Airport, { 
  foreignKey: 'pickup_airport_id', 
  as: 'pickup_airport' 
});
RideBooking.belongsTo(Airport, { 
  foreignKey: 'dropoff_airport_id', 
  as: 'dropoff_airport' 
});

RideBooking.hasMany(Payment, { 
  foreignKey: 'booking_id', 
  as: 'payments' 
});
Payment.belongsTo(RideBooking, { 
  foreignKey: 'booking_id', 
  as: 'booking' 
});

RideBooking.hasOne(DriverRating, { 
  foreignKey: 'booking_id', 
  as: 'rating' 
});
DriverRating.belongsTo(RideBooking, { 
  foreignKey: 'booking_id', 
  as: 'booking' 
});

// Sync Models (Use with caution in production)
// sequelize.sync({ force: false });

module.exports = {
  sequelize,
  User,
  Airport,
  Vehicle,
  RideBooking,
  Payment,
  DriverRating,
  PricingRule
};