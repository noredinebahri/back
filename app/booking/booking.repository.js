const { queryDatabase } = require("../../params/db"); // Import your database connection module
const { v4 } = require('uuid');
const axios = require('axios');
const tangerAirport = { longitude: '-5.9129331', latitude: '35.7261039' };
const rabatAirport = { longitude: '-6.7495096', latitude: '34.0502967' };
async function calculateDistance2(rabatAirport, tangerAirport) {
     try {
          
         const response = await axios.get('https://router.project-osrm.org/route/v1/driving/' +
             `${rabatAirport.longitude},${rabatAirport.latitude};${tangerAirport.longitude},${tangerAirport.latitude}?overview=full&geometries=geojson`);
 
         const distanceEnMetres = response.data.routes[0].distance;
         const distanceEnKm = distanceEnMetres / 1000;
         console.log("Distance 2 calculée par OSRM :", distanceEnKm, "km");
         return distanceEnKm;
     } catch (error) {
         console.error('Erreur lors du calcul de la distance:', error);
         throw error;
     }
 }
 calculateDistance2(rabatAirport,tangerAirport)
async function calculateDistance(origin, destination) {
     try {
          
          const response = await axios.get('https://router.project-osrm.org/route/v1/driving/' +
              `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`);
  
          const distanceEnMetres = response.data.routes[0].distance;
          const distanceEnKm = distanceEnMetres / 1000;
          console.log("Distance 1 calculée par OSRM :", distanceEnKm, "km");
          return distanceEnKm;
      } catch (error) {
          console.error('Erreur lors du calcul de la distance:', error);
          throw error;
      }
   }

async function getAllRidesFromDb() {
    try {
        const rides = await queryDatabase('CALL GetAllRides()');
        return rides;
    } catch (error) {
        console.error('Error fetching rides from database:', error);
        throw error; // Re-throw the error for the service to handle
    }
}
const { RideBooking, Airport, User } = require("./booking.model"); // Assuming you have these models

async function createRideBooking(newRide) {
const origin = {
     latitude: 37.7749,
     longitude: -122.4194
     };
     
     const destination = {
     latitude: 34.0522,
     longitude: -118.2437
     };
  // const ctusomerId = '6c3179b6-f7d9-4aae-9bf1-b3c99a34d292';
  const booking_id = v4();
  const driverId = null;
  const pickupAirportId = '8e3179b6-f7d9-4aae-9bf1-b3c99a34d215';
  const dropoffAirportId = 'b14179b6-f7d9-4aae-9bf1-b3c99a34d218';
  const { 
     pickup_location,
     customerId,
     dropoff_location, 
     pickup_datetime, 
     estimated_dropoff_datetime, 
     booking_status, 
     ride_type, 
     total_distance, 
     total_price, 
     payment_status,airport_code, city, airport_name,country
  } = newRide;
const airportId = '8e3179b6-f7d9-4aae-9bf1-b3c99a34d215';
  const rideBookingData = {
    customer_id: customerId,
    driver_id: driverId,
    pickup_airport_id: pickupAirportId,
    dropoff_airport_id: dropoffAirportId,
    pickup_location,
    dropoff_location,
    pickup_datetime,
    estimated_dropoff_datetime,
    booking_status,
    ride_type,
    total_distance,
    total_price,
    payment_status,
    booking_id,

    airport_code, city, airport_name,country, airportId
  };

  try {
    // Step 1: Check if airports exist and insert if they don't exist
    const origin = await checkOriginAirport(pickupAirportId);
    const destination = await checkDestinationAirport(dropoffAirportId);
    calculateDistance(origin, destination)

    // Step 2: Create the ride booking using Sequelize
    const newRideBooking = await RideBooking.create(rideBookingData);

    return newRideBooking.booking_id; // Return the created booking_id
  } catch (error) {
    console.error('Error creating ride booking:', error);
    throw error;
  }
}

// Check and insert airports if they don't exist
async function checkOriginAirport(airportId) {
     try {
       const airport = await Airport.findOne({ where: { airport_id: airportId } });
       console.log(airport);
       return {
         latitude: parseFloat(airport.latitude).toFixed(7),  // Correct order
         longitude: parseFloat(airport.longitude).toFixed(7)  // Correct order
       };
     } catch (error) {
       console.error('Error checkOriginAirport:', error);
       throw error;
     }
   }
   
   async function checkDestinationAirport(airportId) {
     try {
       const airport = await Airport.findOne({ where: { airport_id: airportId } });
       return {
         latitude: parseFloat(airport.latitude).toFixed(7),  // Correct order
         longitude: parseFloat(airport.longitude).toFixed(7)  // Correct order
       };
     } catch (error) {
       console.error('Error checkDestinationAirport:', error);
       throw error;
     }
   }
   
// async function createRideBooking(newRide) {
//   const customerId = v4();
//   const driverId = v4();
//   const pickupAirportId = v4();
//   const dropoffAirportId = v4();
//   const { 
//     pickupLocation, 
//     dropoffLocation, 
//     pickupDatetime, 
//     bookingStatus, 
//     rideType, 
//     basePrice, 
//     totalPrice 
//   } = newRide; 
  
//   const f = {
//     customerId, driverId, pickupAirportId, dropoffAirportId, pickupLocation, dropoffLocation, pickupDatetime, bookingStatus, rideType, basePrice, totalPrice
//   };

//   console.log(f);

//   // Step 1: Check if airports exist and insert if they don't exist
//   await checkAndInsertAirport(pickupAirportId);
//   await checkAndInsertAirport(dropoffAirportId);

//   try {
//     const [result] = await queryDatabase(`
//       INSERT INTO Ride_Bookings (
//         booking_id,
//         customer_id,
//         driver_id,
//         pickup_airport_id,
//         dropoff_airport_id,
//         pickup_location,
//         dropoff_location,
//         pickup_datetime,
//         booking_status,
//         ride_type,
//         base_price,
//         total_price
//       ) VALUES (
//         UUID_TO_BIN(UUID()),
//         ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
//       )`, 
//       [customerId, driverId, pickupAirportId, dropoffAirportId, pickupLocation, dropoffLocation, pickupDatetime, bookingStatus, rideType, basePrice, totalPrice]
//     );
    
//     return result.insertId; // Return the inserted ID
//   } catch (error) {
//     console.error('Error creating ride booking:', error);
//     throw error; 
//   }
// }

// Step 2: Helper function to check and insert airport if it doesn't exist
// async function checkAndInsertAirport(airportId) {
//   const airportExists = await queryDatabase(`
//     SELECT COUNT(*) AS count FROM Airports WHERE airport_id = UUID_TO_BIN(?)
//   `, [airportId]);

//   if (airportExists[0].count === 0) {
//     // Insert the missing airport (you can modify this part to insert appropriate details)
//     await queryDatabase(`
//       INSERT INTO Airports (airport_id, airport_name, airport_code, city, country)
//       VALUES (UUID_TO_BIN(?), ?, ?, ?, ?)
//     `, [airportId, 'Unknown Airport', 'UNK', 'Unknown City', 'Unknown Country']);
//   }
// }
module.exports = { getAllRidesFromDb, createRideBooking };