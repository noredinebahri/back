const bookingService = require('./booking.service');
const bookingRepository = require('./booking.repository');
const { Airport, City, RideBooking,Payment } = require("./booking.model");
const { generateResponse } = require("./gptService");
const flightdata = require('flight-data');
const axios = require('axios');
const YOUR_DOMAIN = 'http://localhost:4200'; // Adapter selon votre domaine
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const uuidv4 = require('uuid').v4;
async function getRideBooking(req, res) {
  try {
    const rides = await bookingService.getAllRides();
    res.status(200).json({ payload: rides, sucess: true });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to retrieve rides.', success: false }); // Send a 500 error
  }
}
/**
 * Génère une nouvelle réservation de taxi
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.generate = async (req, res) => {
  try {
    const { 
      pickup_location, 
      dropoff_location, 
      pickup_datetime,
      pickup_lat,
      pickup_lng, 
      dropoff_lat,
      dropoff_lng,
      ride_type = 'INTRA_CITY',
      vehicle_type = 'SEDAN',
      passengers = 1,
      luggage = 0,
      currency = 'MAD'
    } = req.body;

    // Vérifier les données obligatoires
    if (!pickup_location || !dropoff_location || !pickup_datetime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les informations de départ, d\'arrivée et l\'heure de prise en charge sont requises' 
      });
    }

    // Vérifier que le nombre de passagers ne dépasse pas 6
    if (passengers > 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum 6 passagers autorisés par véhicule' 
      });
    }

    // Générer un ID unique pour la réservation
    const booking_id = uuidv4();

    // Déterminer le point de départ et d'arrivée
    let fromLocation, toLocation;
    let distance = 0;
    
    // Aéroports par défaut (nécessaires pour la structure de la base de données)
    const defaultPickupAirportId = "DEFAULT-APT-001";
    const defaultDropoffAirportId = "DEFAULT-APT-002";

    // Calculer la distance en utilisant les coordonnées
    if (pickup_lat && pickup_lng && dropoff_lat && dropoff_lng) {
      distance = calculateDistance(
        parseFloat(pickup_lat), 
        parseFloat(pickup_lng), 
        parseFloat(dropoff_lat), 
        parseFloat(dropoff_lng)
      );
    } else {
      // Si pas de coordonnées, essayer de déterminer la distance à partir des noms de lieux
      // Chercher les lieux dans la base de données
      fromLocation = await City.findOne({ 
        where: { city_name: pickup_location.split(',')[0].trim() } 
      });
      
      toLocation = await City.findOne({ 
        where: { city_name: dropoff_location.split(',')[0].trim() } 
      });

      if (fromLocation && toLocation) {
        distance = calculateDistance(
          parseFloat(fromLocation.latitude),
          parseFloat(fromLocation.longitude),
          parseFloat(toLocation.latitude),
          parseFloat(toLocation.longitude)
        );
      } else {
        // Distance par défaut si impossible à calculer
        distance = 10;
      }
    }

    // Calculer le prix estimé
    let baseFare;
    let perKmRate;
    
    // Tarifs selon le type de véhicule
    switch(vehicle_type) {
      case 'SUV':
        baseFare = 30;
        perKmRate = 3;
        break;
      case 'LUXURY':
        baseFare = 50;
        perKmRate = 4;
        break;
      case 'MINIVAN':
        baseFare = 40;
        perKmRate = 3.5;
        break;
      default: // SEDAN
        baseFare = 20;
        perKmRate = 2.5;
    }
    
    // Calcul du prix total
    const passengerFare = 5;
    let totalPrice = baseFare + (distance * perKmRate) + (passengers * passengerFare);
    
    // Supplément pour les bagages
    if (luggage > 0) {
      totalPrice += luggage * 3;
    }
    
    // Arrondir le prix à 2 décimales
    totalPrice = Math.round(totalPrice * 100) / 100;

    // Créer l'enregistrement de réservation
    const booking = await RideBooking.create({
      booking_id,
      customer_id: req.user.user_id,
      pickup_location,
      dropoff_location,
      pickup_datetime,
      pickup_airport_id: defaultPickupAirportId,
      dropoff_airport_id: defaultDropoffAirportId,
      booking_status: 'PENDING',
      ride_type,
      total_distance: distance,
      total_price: totalPrice,
      payment_status: 'PENDING',
      fromAirport: pickup_location,
      toCity: dropoff_location,
      vehicleType: vehicle_type,
      passengers,
      luggage,
      currency,
      estimatedDuration: `${Math.round(distance / 60 * 60)} min`, // Estimation basée sur 60km/h de moyenne
      // Coordonnées GPS si fournies
      ...(pickup_lat && pickup_lng ? { latitude: pickup_lat, longitude: pickup_lng } : {}),
    });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: booking
    });
  } catch (error) {
    console.error('Error generating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message
    });
  }
};
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Arrondi à 2 décimales
}
function toRad(value) {
  return value * Math.PI / 180;
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
  console.log(req.body);
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
    const { 
      amount, 
      currency, 
      description, 
      user_id, 
      fromAirport, 
      toCity, 
      flightNumber, 
      departureTime, 
      arrivalTime, 
      estimatedDuration, 
      vehicleType, 
      passengers, 
      luggage, 
      partner 
    } = req.body;
    
    // Vérifier que les informations requises sont présentes
    if (!user_id || !fromAirport || !toCity) {
      return res.status(400).json({ error: 'Missing required metadata for session creation' });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'usd',
          product_data: {
            name: description || 'Dynamic Service',
          },
          unit_amount: Math.round(amount * 100), // Stripe attend le montant en cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: {
        user_id,      // ex: "user_001"
        amount,       // ex: "73.47"
        currency,     // ex: "GBP"
        fromAirport,  // ex: "Casablanca Mohammed V Airport (CMN), Casa-Oasis, Nouasseur, Casablanca 8101, Maroc"
        toCity,       // ex: "Ibis Rabat Agdal, Avenue Haj Ahmed, Place De La Gare, Rue Cherkaoui, Rabat 10000, Maroc"
        flightNumber, // ex: "AA7979"
        departureTime, // ex: "ven., 14 févr. · 14:30"
        arrivalTime,  // ex: "ven., 14 févr. · 15:56"
        estimatedDuration, // ex: "86 min"
        vehicleType,  // ex: "Standard"
        passengers,   // ex: "3"
        luggage,      // ex: "3"
        partner       // ex: "Transferz"
      },
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.completeTransaction = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Vérifier que le paiement est bien terminé
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment has not been completed' });
    }

    // Liste des champs requis dans le metadata
    const requiredFields = [
      'user_id', 
      'fromAirport', 
      'toCity', 
      'flightNumber', 
      'departureTime', 
      'arrivalTime', 
      'estimatedDuration', 
      'vehicleType', 
      'passengers', 
      'luggage', 
      'partner'
    ];

    // Validation des métadonnées
    for (let field of requiredFields) {
      if (!session.metadata[field]) {
        return res.status(400).json({ error: `Missing required metadata field: ${field}` });
      }
    }

    // Création de la transaction (exemple)
    const transactionData = {
      transaction_id: session.id,
      user_id: session.metadata.user_id,
      amount: parseFloat(session.metadata.amount),
      currency: session.metadata.currency,
      payment_method: session.payment_method_types[0]?.toUpperCase() || 'UNKNOWN',
      payment_status: 'SUCCESSFUL',
      transaction_date: new Date()
    };

    const transaction = await transactionService.createTransaction(transactionData);

    // Construire l'objet booking avec les informations provenant du metadata
    const booking = {
      departureTime: session.metadata.departureTime,
      fromAirport: session.metadata.fromAirport,
      arrivalTime: session.metadata.arrivalTime,
      estimatedDuration: session.metadata.estimatedDuration,
      toCity: session.metadata.toCity,
      flightNumber: session.metadata.flightNumber,
      vehicleType: session.metadata.vehicleType,
      passengers: session.metadata.passengers,
      luggage: session.metadata.luggage,
      partner: session.metadata.partner,
      price: session.metadata.amount,
      currency: session.metadata.currency
    };

    // Vous pouvez stocker le booking dans votre base de données ou l'utiliser dans votre logique métier

    // Renvoyer la transaction et l'objet booking dans la réponse
    res.status(200).json({ transaction, booking, driver: {} });
  } catch (error) {
    console.error('Error in completeTransaction endpoint:', error);
    res.status(500).json({ error: error.message });
  }
};
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

/**
 * Créer un paiement en espèces
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createCashPayment = async (req, res) => {
  try {
    const { booking_id } = req.params;
    
    // Vérifier si la réservation existe
    const booking = await RideBooking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Réservation non trouvée' 
      });
    }
    
    // Vérifier si la réservation a déjà été payée
    const existingPayment = await Payment.findOne({ 
      where: { 
        booking_id, 
        payment_status: 'COMPLETED' 
      } 
    });
    
    if (existingPayment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cette réservation a déjà été payée' 
      });
    }
    
    // Vérifier que l'utilisateur est soit le client, soit le chauffeur, soit un admin
    if (req.user.user_id !== booking.customer_id && 
        req.user.user_id !== booking.driver_id && 
        req.user.user_type !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Non autorisé à effectuer le paiement' 
      });
    }
    
    // Créer le paiement
    const payment_id = uuidv4();
    const payment = await Payment.create({
      payment_id,
      booking_id,
      user_id: booking.customer_id,
      amount: booking.total_price,
      currency: booking.currency || 'MAD',
      payment_method: 'CASH',
      payment_status: 'COMPLETED',
      payment_date: new Date()
    });
    
    // Mettre à jour le statut de paiement de la réservation
    booking.payment_status = 'PAID';
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Paiement en espèces enregistré avec succès',
      data: payment
    });
  } catch (error) {
    console.error('Error creating cash payment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement en espèces',
      error: error.message
    });
  }
};

/**
 * Créer un paiement par carte
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createCardPayment = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { card_number, expiry_date, cvv } = req.body;
    
    // Validation des données de carte
    if (!card_number || !expiry_date || !cvv) {
      return res.status(400).json({ 
        success: false, 
        message: 'Informations de carte incomplètes' 
      });
    }
    
    // Vérifier si la réservation existe
    const booking = await RideBooking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Réservation non trouvée' 
      });
    }
    
    // Vérifier si la réservation a déjà été payée
    const existingPayment = await Payment.findOne({ 
      where: { 
        booking_id, 
        payment_status: 'COMPLETED' 
      } 
    });
    
    if (existingPayment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cette réservation a déjà été payée' 
      });
    }
    
    // Vérifier que l'utilisateur est le client
    if (req.user.user_id !== booking.customer_id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Seul le client peut effectuer un paiement par carte' 
      });
    }
    
    // Simuler un traitement de paiement par carte
    // Dans une vraie application, vous utiliseriez un service comme Stripe ou PayPal
    const transaction_id = `TR-${Date.now()}`;
    const card_last_four = card_number.slice(-4);
    
    // Créer le paiement
    const payment_id = uuidv4();
    const payment = await Payment.create({
      payment_id,
      booking_id,
      user_id: booking.customer_id,
      amount: booking.total_price,
      currency: booking.currency || 'MAD',
      payment_method: 'CARD',
      payment_status: 'COMPLETED',
      transaction_id,
      card_last_four,
      payment_date: new Date()
    });
    
    // Mettre à jour le statut de paiement de la réservation
    booking.payment_status = 'PAID';
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Paiement par carte effectué avec succès',
      data: payment
    });
  } catch (error) {
    console.error('Error creating card payment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du paiement par carte',
      error: error.message
    });
  }
};

/**
 * Créer un paiement par abonnement
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createSubscriptionPayment = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { subscription_id } = req.body;
    
    // Validation des données
    if (!subscription_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID d\'abonnement requis' 
      });
    }
    
    // Vérifier si la réservation existe
    const booking = await RideBooking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Réservation non trouvée' 
      });
    }
    
    // Vérifier si la réservation a déjà été payée
    const existingPayment = await Payment.findOne({ 
      where: { 
        booking_id, 
        payment_status: 'COMPLETED' 
      } 
    });
    
    if (existingPayment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cette réservation a déjà été payée' 
      });
    }
    
    // Vérifier que l'utilisateur est le client
    if (req.user.user_id !== booking.customer_id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Seul le client peut effectuer un paiement par abonnement' 
      });
    }
    
    // Vérifier si l'abonnement existe et est actif
    const subscription = await Subscription.findOne({
      where: {
        subscription_id,
        user_id: req.user.user_id,
        is_active: true
      }
    });
    
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Abonnement non trouvé ou inactif' 
      });
    }
    
    // Vérifier s'il reste des crédits disponibles
    const remainingCredits = subscription.credits_total - subscription.credits_used;
    const tripCost = Math.ceil(booking.total_price); // Convertir en crédits (1 crédit = 1 MAD)
    
    if (remainingCredits < tripCost) {
      return res.status(400).json({ 
        success: false, 
        message: `Crédits insuffisants. Vous avez ${remainingCredits} crédits, mais la course coûte ${tripCost} crédits.` 
      });
    }
    
    // Mettre à jour les crédits utilisés
    subscription.credits_used += tripCost;
    await subscription.save();
    
    // Créer le paiement
    const payment_id = uuidv4();
    const payment = await Payment.create({
      payment_id,
      booking_id,
      user_id: booking.customer_id,
      amount: booking.total_price,
      currency: booking.currency || 'MAD',
      payment_method: 'SUBSCRIPTION',
      payment_status: 'COMPLETED',
      subscription_id,
      payment_date: new Date()
    });
    
    // Mettre à jour le statut de paiement de la réservation
    booking.payment_status = 'PAID';
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Paiement par abonnement effectué avec succès',
      data: {
        payment,
        subscription: {
          remaining_credits: subscription.credits_total - subscription.credits_used,
          plan_name: subscription.plan_name
        }
      }
    });
  } catch (error) {
    console.error('Error creating subscription payment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du paiement par abonnement',
      error: error.message
    });
  }
};

/**
 * Obtenir l'historique des paiements d'un utilisateur
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const payments = await Payment.findAll({
      where: { user_id: userId },
      include: [
        { 
          model: RideBooking, 
          as: 'booking',
          attributes: ['booking_id', 'pickup_location', 'dropoff_location', 'pickup_datetime', 'total_distance']
        }
      ],
      order: [['payment_date', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements',
      error: error.message
    });
  }
};

/**
 * Modification de la fonction pour compléter une course en vérifiant le paiement
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.completeRide = async (req, res) => {
  try {
    const { booking_id } = req.params;
    
    // Vérifier si la réservation existe
    const booking = await RideBooking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Réservation non trouvée' 
      });
    }
    
    // Vérifier que l'utilisateur est bien le chauffeur assigné à cette course
    if (req.user.user_type !== 'DRIVER' || booking.driver_id !== req.user.user_id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Seul le chauffeur assigné peut compléter cette course' 
      });
    }
    
    // Vérifier que la course est en cours (IN_PROGRESS)
    if (booking.booking_status !== 'IN_PROGRESS') {
      return res.status(400).json({ 
        success: false, 
        message: 'Seule une course en cours peut être complétée' 
      });
    }
    
    // Vérifier si le paiement est déjà effectué
    const payment = await Payment.findOne({
      where: {
        booking_id,
        payment_status: 'COMPLETED'
      }
    });
    
    // Si paiement effectué, compléter la course
    if (payment) {
      // Mettre à jour le statut
      booking.booking_status = 'COMPLETED';
      
      // Enregistrer l'heure de fin
      booking.completed_at = new Date();
      
      await booking.save();
      
      res.status(200).json({
        success: true,
        message: 'Course complétée avec succès',
        data: booking
      });
    } else {
      // Si pas de paiement, informer que le paiement est requis
      res.status(400).json({
        success: false,
        message: 'Le paiement est requis avant de compléter la course',
        payment_methods: ['CASH', 'CARD', 'SUBSCRIPTION']
      });
    }
  } catch (error) {
    console.error('Error completing ride:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la complétion de la course',
      error: error.message
    });
  }
};
