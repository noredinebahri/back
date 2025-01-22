const bookingService = require('./booking.service');
const bookingRepository = require('./booking.repository');
const {Airport, City} = require("./booking.model");
const { generateResponse } = require("./gptService");
const flightdata = require('flight-data');
const axios = require('axios');

async function getRideBooking(req, res) {
    try {
        const rides = await bookingService.getAllRides();
        res.status(200).json({payload: rides, sucess: true});
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve rides.', success: false }); // Send a 500 error
    }
}
exports.generate = async (req, res) => {
  const { prompt } = req.body;
    try {
        console.log("Prompt reçu :", prompt);
        const response = await bookingService.generateResponse(prompt);
        console.log("Réponse générée :", response);
        res.status(200).json({ response });
    } catch (error) {
        console.error("Erreur :", error);
        res.status(500).json({ error: error.message });
    }
}
exports.getMoroccanAirports = async (req, res) => {
  try {
    const airports = await Airport.findAll({
      where: { country: 'Maroc' }
    });
    res.status(200).json(airports);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des aéroports.' });
  }
};
exports.getCitiesByAirport = async (req, res) => {
  const { airportId } = req.params;
  try {
    const bookings = await RideBooking.findAll({
      where: { pickup_airport_id: airportId },
      attributes: ['dropoff_location'],
      group: ['dropoff_location']
    });
    const cities = bookings.map(b => b.dropoff_location);
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des villes' });
  }
};

// Obtenir les lieux (hôtels, restaurants) dans une ville
exports.getPlacesByCity = async (req, res) => {
  const { city } = req.params;
  try {
    const places = await City.findAll();
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des lieux' });
  }
};
exports.calculteRideFromTo = async (req, res) => {
 try {
  const {from, to} = req.body;
  const result = await  this.bookingService.calculteRideFromTo(from, to)
   res.status(200).json(result);
 } catch (error) {
  res.status(404).json(error);
 }
}
async function createRideBooking(req, res) {
     try {
       const newRide = req.body; 
       const bookingId = await bookingService.addRide(newRide);
       res.status(201).json({ message: 'Ride booking created successfully', bookingId });
     } catch (error) {
       console.error('Error in booking controller:', error);
       res.status(500).json({ error: error.message || 'Failed to create ride booking.' });
     }
   }

   async function getFlightByIataAndNumber(flight_number, airline_iata) {
    try {
      const response = await axios.get('http://api.aviationstack.com/v1/flights', {
        params: {
          access_key: '557bc3ccce80ec0a9d7d67616f766b44',
          flight_number,
          airline_iata,
          limit: 2
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching flight data:', error);
      throw error;
    }
  }
  
  exports.calculatePrice = async (req, res) => {
    const { airportId, cityId, passengers, luggage } = req.body;
    // console.log(req.body);
    try {
      // Check if flight number exists
      // const flightData = await getFlightByIataAndNumber(flight_number, arr_iata);
      // if (flightData && flightData.data && flightData.data.length > 0) {
        // console.log('flight: ', flightData);
        // Proceed with calculating distance and price
        const result = await bookingRepository.calculateDistance2(airportId, cityId, passengers, luggage);
        res.status(200).json({ distance: result.distance, price: result.price });
      // } else {
        // res.status(404).json({ message: 'Flight data not found' });
      // }
    } catch (error) {
      console.error('Error calculating price:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
// module.exports = { getRideBooking, createRideBooking };