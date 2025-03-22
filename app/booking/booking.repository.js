const axios = require('axios');
const {Airport, City} = require("./booking.model");
const stripe = require('stripe')('sk_test_51KYsoWLQSEoYz0V0ow1U9RzuRpyvtFzcbDy7I64Vpu1Y5jXk67kYGg94HZ6La5xnjvIXymd1UgYVWVk0Pu1BgGsq00pJ9PFR0D');

async function createCheckoutSession(priceId) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:4200/success.html',
    cancel_url: 'http://localhost:4200/cancel.html',
  });

  return session;
}

// Modification de la méthode pour inclure le calcul du prix
async function calculateDistance2(originAirportId, destinationCityId, passengers, luggage) {
  try {
    // Retrieve airport and city using their IDs
    const origin = await Airport.findOne({ where: { airport_id: originAirportId } });
    const destination = await City.findOne({ where: { city_id: destinationCityId } });
    
    if (!origin || !destination) {
      throw new Error('Airport or City not found');
    }

    // Call OSRM API to calculate distance (in meters)
    const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`);
    const distanceInMeters = response.data.routes[0].distance;
    const distanceInKm = distanceInMeters / 1000;
    console.log(`Calculated distance: ${distanceInKm.toFixed(2)} km`);

    // Calculate price using business logic
    const basePrice = 3;
    const pricePerKm = 6.1;
    let passengerFee = 0;
    const luggageFee = 1;
    
    // Example: simple logic for passenger fee adjustment
    if (passengers === 1) {
      passengerFee = 1;
    } else if (passengers > 1 && passengers < 3) {
      passengerFee = 1.5;
    } else if (passengers >= 3 && passengers < 5) {
      passengerFee = 2;
    } else {
      passengerFee = 1.3;
    }
    
    // Calculate total price and adjust as necessary (here, dividing by 10 as in original code)
    const totalPrice = (basePrice + (distanceInKm * pricePerKm) + passengerFee + luggageFee) / 10;
    
    return {
      distance: distanceInKm.toFixed(2),
      price: totalPrice.toFixed(2)
    };
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw error;
  }
}

// Récupération des coordonnées de l'aéroport
async function checkOriginAirport(airportId) {
  const airport = await Airport.findOne({ where: { airport_id: airportId } });
  return {
    latitude: parseFloat(airport.latitude),
    longitude: parseFloat(airport.longitude)
  };
}

// Récupération des coordonnées de la ville de destination
async function checkDestinationCity(cityId) {
  const city = await City.findOne({ where: { city_id: cityId } });
  return {
    latitude: parseFloat(city.latitude),
    longitude: parseFloat(city.longitude)
  };
}

module.exports = { calculateDistance2 };
