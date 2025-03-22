const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require("../../params/db");
const bcrypt = require('bcrypt');

// Users Model
class User extends Model { }

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
      isEmail: true
    }
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '',
    unique: true
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
    type: DataTypes.STRING(500),
    allowNull: true
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
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',
  timestamps: true
});

// Méthode pour valider le mot de passe
User.prototype.validPassword = async function(password) {
  try {
    // Si le mot de passe est haché avec bcrypt
    if (bcrypt.getRounds(this.password_hash)) {
      return await bcrypt.compare(password, this.password_hash);
    } else {
      // Si le mot de passe n'est pas haché (pour le développement uniquement)
      return this.password_hash === password;
    }
  } catch (error) {
    // Si bcrypt.getRounds échoue, cela signifie que le mot de passe n'est pas haché
    // Comparaison directe (pour le développement uniquement)
    return this.password_hash === password;
  }
};

// Hook avant la création pour hacher le mot de passe
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    try {
      // Vérifier si le mot de passe est déjà haché
      const rounds = bcrypt.getRounds(user.password_hash);
      if (rounds) {
        return; // Le mot de passe est déjà haché
      }
    } catch (error) {
      // Le mot de passe n'est pas haché, continuez pour le hacher
    }
    
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

// Hook avant la mise à jour pour hacher le mot de passe si modifié
User.beforeUpdate(async (user) => {
  if (user.changed('password_hash')) {
    try {
      // Vérifier si le mot de passe est déjà haché
      const rounds = bcrypt.getRounds(user.password_hash);
      if (rounds) {
        return; // Le mot de passe est déjà haché
      }
    } catch (error) {
      // Le mot de passe n'est pas haché, continuez pour le hacher
    }
    
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});
class Transaction extends Model { }

Transaction.init({
  transaction_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  driver_id: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  booking_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  airport_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('CARD', 'DEBIT_CARD', 'PAYPAL', 'CASH'),
    allowNull: false
  },
  payment_status: {
    type: DataTypes.ENUM('PENDING', 'SUCCESSFUL', 'FAILED'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  rejected_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  transaction_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Transaction',
  tableName: 'Transactions',
  timestamps: false
});


// Airports Model
class Airport extends Model { }
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
class City extends Model { }
City.init({
  city_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  city_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  population: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'City',
  tableName: 'cities'
});

// Vehicles Model
class Vehicle extends Model { }
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
class RideBooking extends Model { }
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
    type: DataTypes.ENUM('AIRPORT_PICKUP', 'AIRPORT_DROPOFF', 'ROUND_TRIP', 'CITY_TO_CITY'),
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
  },
  // Nouveaux champs pour les informations complémentaires du booking
  fromAirport: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Information sur l\'aéroport de départ'
  },
  toCity: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Destination ou lieu d\'arrivée'
  },
  flightNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Numéro de vol'
  },
  departureTime: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Heure de départ prévue (format texte pour conserver la mise en forme)'
  },
  arrivalTime: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Heure d\'arrivée prévue'
  },
  estimatedDuration: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Durée estimée du trajet (ex: "86 min")'
  },
  vehicleType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Type de véhicule (ex: "Standard")'
  },
  passengers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Nombre de passagers'
  },
  luggage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Nombre de bagages'
  },
  partner: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Partenaire avec lequel la réservation est effectuée'
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Devise utilisée pour la transaction'
  }
}, {
  sequelize,
  timestamps: true,
  modelName: 'RideBooking',
  tableName: 'Ride_Booking',
  validate: {
    pickupBeforeDropoff() {
      if (this.pickup_datetime && this.estimated_dropoff_datetime && this.pickup_datetime >= this.estimated_dropoff_datetime) {
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
class Payment extends Model { }
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
class DriverRating extends Model { }
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
class PricingRule extends Model { }
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
class Driver extends Model { }

Driver.init({
  driver_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { isEmail: true }
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  vehicle_id: {
    type: DataTypes.STRING(255),
    references: {
      model: Vehicle,
      key: 'vehicle_id'
    }
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Driver',
  tableName: 'Drivers',
  timestamps: true // Automatically adds createdAt and updatedAt
});
// Define Associations
User.hasMany(Vehicle, { foreignKey: 'driver_id', as: 'vehicles' });
Vehicle.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

User.hasMany(RideBooking, {
  foreignKey: 'customer_id',
  as: 'customer_bookings'
});
Driver.hasOne(Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'driver_vehicle'
});

Transaction.hasOne(Driver, {
  foreignKey: 'vehicle_id',
  as: 'driver_transaction'
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
class PickupPoint extends Model { }
PickupPoint.init({
  pickup_point_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  booking_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: 'Ride_Booking',
      key: 'booking_id'
    }
  },
  passenger_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  passenger_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  passenger_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 7),
    allowNull: false
  },
  distance_from_start: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Distance en km depuis le point de départ'
  },
  percent_of_total_distance: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Pourcentage du trajet total'
  },
  price_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Pourcentage du prix total appliqué'
  },
  price_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Montant à payer pour ce passager'
  },
  pickup_status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'PICKED_UP', 'CANCELLED'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  pickup_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'PickupPoint',
  tableName: 'Pickup_Points',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// PricingRule Model ajouté avec les règles de tarification pour les ramassages intermédiaires
class PricingDistance extends Model { }
PricingDistance.init({
  pricing_distance_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },
  driver_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  },
  min_percent_distance: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Pourcentage minimum de distance depuis le point de départ'
  },
  max_percent_distance: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Pourcentage maximum de distance depuis le point de départ'
  },
  price_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Pourcentage du prix total à appliquer'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'PricingDistance',
  tableName: 'Pricing_Distances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Ajouter les associations
RideBooking.hasMany(PickupPoint, { foreignKey: 'booking_id', as: 'pickup_points' });
PickupPoint.belongsTo(RideBooking, { foreignKey: 'booking_id', as: 'booking' });

User.hasMany(PricingDistance, { foreignKey: 'driver_id', as: 'pricing_distances' });
PricingDistance.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });
module.exports = {
  sequelize,
  User,
  Airport,
  Vehicle,
  PickupPoint,
  PricingDistance,
  RideBooking,
  Payment,
  DriverRating,
  PricingRule,
  City,
  Transaction,
  Driver
};