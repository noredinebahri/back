const bookingService = require('./booking.service');
const bookingRepository = require('./booking.repository');
const { Airport, City } = require("./booking.model");
const { generateResponse } = require("./gptService");
const flightdata = require('flight-data');
const axios = require('axios');
const YOUR_DOMAIN = 'http://localhost:4200'; // Adapter selon votre domaine
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function getRideBooking(req, res) {
  try {
    const rides = await bookingService.getAllRides();
    res.status(200).json({ payload: rides, sucess: true });
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
    const { from, to } = req.body;
    const result = await this.bookingService.calculteRideFromTo(from, to)
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json(error);
  }
}
// async function createRideBooking(req, res) {
//      try {
//        const newRide = req.body; 
//        const bookingId = await bookingService.addRide(newRide);
//        res.status(201).json({ message: 'Ride booking created successfully', bookingId });
//      } catch (error) {
//        console.error('Error in booking controller:', error);
//        res.status(500).json({ error: error.message || 'Failed to create ride booking.' });
//      }
//    }

//  async function getFlightByIataAndNumber(flight_number, airline_iata) {
//   try {
//     const response = await axios.get('http://api.aviationstack.com/v1/flights', {
//       params: {
//         access_key: '557bc3ccce80ec0a9d7d67616f766b44',
//         flight_number,
//         airline_iata,
//         limit: 2
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching flight data:', error);
//     throw error;
//   }
// }

const convertCurrencies = async (price, fromCurrency, toCurrency) => {
  try {
    const apiKey = process.env.FREE_CURRENCY_API_KEY;
    if (!apiKey) throw new Error("La clé API pour les devises n'est pas définie.");

    const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${fromCurrency}`;
    const response = await axios.get(url);
    
    if (!response.data.data || !response.data.data[toCurrency]) {
      throw new Error(`Impossible de trouver le taux de conversion de ${fromCurrency} en ${toCurrency}.`);
    }

    return (price * response.data.data[toCurrency]).toFixed(2);
  } catch (error) {
    console.error(`Erreur de conversion des devises : ${error.message}`);
    return `Erreur : ${error.message}`;
  }
};

exports.calculatePrice = async (req, res) => {
  const { airportId, cityId, passengers, luggage } = req.body;
  try {
    const result = await bookingRepository.calculateDistance2(airportId, cityId, passengers, luggage);
    const [priceUsd, priceEuro] = await Promise.all([
      convertCurrencies(result.price, 'USD', 'EUR'),
      convertCurrencies(result.price, 'EUR', 'MAD')
    ]);
    console.log(priceUsd, priceEuro);
    res.status(200).json({ 
      distance: result.distance, 
      price: result.price, 
      priceUSD: priceUsd, 
      priceEUR: priceEuro 
    });
  } catch (error) {
    console.error('Erreur lors du calcul du prix:', error.message);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

exports.checkoutSession = async (req, res) => {
  try {
    const { amount, currency, phone, fullName, airport, description, city, email, distance } = req.body;
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency || 'usd', // Devise dynamique ou par défaut
            product_data: {
              name: description || 'Dynamic Service', // Nom du produit ou service
            },
            unit_amount: Math.round(amount * 100), // Prix en centimes
          },
          quantity: 1, // Quantité par défaut : 1
        },
      ],
      mode: 'payment',
      metadata: {
        distance: distance, // Distance en KM
        description,
        currency,
        amount
      },
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    res.status(500).json({ error: error.message });
  }
}
exports.sessionStatus = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

    res.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      metadata: session.metadata, // Récupérer les informations personnalisées

    });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut de la session:', error);
    res.status(500).json({ error: 'Une erreur est survenue.' });
  }
}


exports.convertCurrency = async (req, res) => {
  try {
    const { toCurrency, amount } = req.body;
    const fromCurrency = req.body.fromCurrency;
    const apiKey = process.env.FREE_CURRENCY_API_KEY;
    const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${fromCurrency}`;

    const response = await axios.get(url);
    console.log(response.data);
    const rate = response.data.data[toCurrency];
    if (!rate) throw new Error(`Impossible de convertir ${fromCurrency} en ${toCurrency}`);

    res.status(200).json({ currency: (amount * rate).toFixed(2) });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la conversion de devise : ' + error });
  }
};
