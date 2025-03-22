// database.js
const { Sequelize } = require('sequelize');
const { 

  Airport, 
  Vehicle, 
  RideBooking, 
  Payment, 
  DriverRating, 
  PricingRule,
  Transaction
} = require("../app/booking/booking.model"); // Adjust the path to where you saved the models
const Customers = require("../app/user/auth/auth.model");
async function initializeDatabase() {
  try {
    // Option 1: Sync all models (Safe for development)
    // await sequelize.sync({ 
    //   // alter: true, // Uncomment to alter existing tables
    //   // force: true  // CAUTION: Drops and recreates tables - USE ONLY IN DEVELOPMENT
    // });

    // Option 2: More controlled synchronization
    await Airport.sync();
    await Vehicle.sync();
    await RideBooking.sync();
    await Payment.sync();
    await DriverRating.sync();
    await PricingRule.sync();
    await Transaction.sync();
    await Customers.sync().then(() => {
      console.log('Customers table created successfully');
    } );

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Unable to create tables : ', error);
  }
}

// Migration alternative for production
async function runMigrations() {
  try {
    // Create a migration for each model
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Users (
        -- Define your table structure here
      );
    `);

    // Repeat for other tables
    console.log('Migrations run successfully');
  } catch (error) {
    console.error('Migration error: ', error);
  }
}

// For more robust migrations in production
async function checkAndAddColumns() {
  try {
    // Example of safely adding a column
    await sequelize.queryInterface.addColumn('Users', 'new_column', {
      type: Sequelize.STRING,
      allowNull: true
    }).catch(() => {
      // Column might already exist
      console.log('Column may already exist');
    });
  } catch (error) {
    console.error('Column addition error: ', error);
  }
}



// In your main app.js or server.js

