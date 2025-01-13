const axios = require('axios');
const {Airport, City} = require("./booking.model");

// Modification de la méthode pour inclure le calcul du prix
async function calculateDistance2(originAirportId, destinationCityId, passengers, luggage) {
  try {
    // Récupération des coordonnées de l'aéroport
    const origin = await Airport.findOne({ where: { airport_id: originAirportId } });

    // Récupération des coordonnées de la ville de destination
    const destination = await City.findOne({ where: { city_id: destinationCityId } });

    if (!origin || !destination) {
      throw new Error('Aéroport ou ville non trouvée');
    }

    // Appel à l'API OSRM pour calculer la distance
    const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/` +
      `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`);

    const distanceEnMetres = response.data.routes[0].distance;
    const distanceEnKm = distanceEnMetres / 1000;

    console.log(`Distance calculée : ${distanceEnKm} km`);

    // Calcul du prix
    const basePrice = 30;               // Prix de base
    const pricePerKm = 5;              // Prix par kilomètre
    const passengerFee = passengers * 2;  // Frais par passager
    const luggageFee = luggage * 3;      // Frais par bagage

    const totalPrice = basePrice + (distanceEnKm * pricePerKm) + passengerFee + luggageFee;

    return { distance: distanceEnKm.toFixed(2), price: totalPrice.toFixed(2) };
  } catch (error) {
    console.error('Erreur lors du calcul de la distance:', error);
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
