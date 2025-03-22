// driver.controller.js
const driverService = require('./driver.service');

exports.assignDriver = async (req, res) => {
  try {
    // Expected payload: { fromAirport, toCity, price, link, transactionId }
    const assignmentData = req.body;
    const driver = await driverService.assignDriverAndNotify(assignmentData);
    res.status(200).json({ message: 'Driver assigned and notified successfully', driver });
  } catch (error) {
    console.error('Error in assignDriver controller:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getRideDetails = async (req, res) => {
  try {
    const { transactionId } = req.query;
    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID manquant' });
    }
    // Retrieve the transaction (ride) details.
    // Here we assume the transaction model contains the ride details (fromAirport, toCity, price, etc.)
    const transaction = await Transaction.findOne({ where: { transaction_id: transactionId } });
    if (!transaction) {
      return res.status(404).json({ error: 'Détails de la course non trouvés' });
    }
    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error in getRideDetails:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.acceptRide = async (req, res) => {
  try {
    // On suppose que l'identité du conducteur est extraite du token via authMiddleware
    const { transaction, driver } = req.body;
    transactionId = JSON.parse(transaction).transaction_id;
    driver_id = JSON.parse(driver).driver_id;
    console.log(transactionId, driver_id);
    if (!transactionId || !driver_id) {
      return res.status(400).json({ error: 'Transaction ID et/ou driver ID manquant(s)' });
    }

    // Mettre à jour le statut de la transaction et assigner le conducteur
    const updatedTransaction = await driverService.acceptRide(transactionId, driver_id);
    // Notifier le client via Socket.IO (on suppose que transaction.user_id est présent)
    const { io } = require("../../../server"); // Importer l'instance Socket.IO depuis votre serveur principal
    // Exemple dans votre contrôleur après acceptation du chauffeur
    io.to(updatedTransaction.user_id).emit('driver_status', {
      message: 'Votre chauffeur a accepté la course',
      driver: {
        full_name: updatedTransaction.driver.full_name,
        email: updatedTransaction.driver.email,
        phone_number: updatedTransaction.driver.phone_number
        // Ajoutez d'autres informations si nécessaire
      }
    });

    res.status(200).json({ message: 'Course acceptée', transaction: updatedTransaction });
  } catch (error) {
    console.error('Error in acceptRide:', error);
    res.status(500).json({ error: error.message });
  }
};

// checkoutSession dans votre booking.controller.js
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
          unit_amount: Math.round(amount * 100), // en cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: {
        user_id,      // e.g., "user_001"
        amount,       // e.g., "73.47"
        currency,     // e.g., "GBP"
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
// Dans un fichier comme driver.controller.js
exports.getAssignedRides = async (req, res) => {
  const driverId = req.params.driverId;
  try {
    const rides = await Booking.findAll({
      where: { 
        driver_id: driverId,
        status: ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY']
      },
      include: [
        { model: User, as: 'passenger', attributes: ['first_name', 'last_name', 'phone'] }
      ],
      order: [['pickup_datetime', 'ASC']]
    });
    res.status(200).json({ success: true, data: rides });
  } catch (error) {
    console.error('Error fetching assigned rides:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des courses' });
  }
};
exports.updateRideStatus = async (req, res) => {
  const { rideId } = req.params;
  const { status } = req.body; // 'ACCEPTED', 'REJECTED', 'COMPLETED', etc.
  
  try {
    const booking = await Booking.findByPk(rideId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Course non trouvée' });
    }
    
    booking.status = status;
    await booking.save();
    
    // Notification au client si nécessaire
    // ...
    
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating ride status:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du statut' });
  }
};
exports.getDriverStats = async (req, res) => {
  const driverId = req.params.driverId;
  try {
    // Total des courses complétées
    const completedRides = await Booking.count({
      where: { driver_id: driverId, status: 'COMPLETED' }
    });
    
    // Revenus totaux
    const totalEarnings = await Booking.sum('driver_payment', {
      where: { driver_id: driverId, status: 'COMPLETED' }
    });
    
    // Évaluation moyenne
    const avgRating = await DriverRating.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average']],
      where: { driver_id: driverId }
    });
    
    res.status(200).json({
      success: true,
      data: {
        completedRides,
        totalEarnings: totalEarnings || 0,
        avgRating: avgRating?.getDataValue('average') || 0
      }
    });
  } catch (error) {
    console.error('Error fetching driver stats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
  }
};
exports.updateDriverAvailability = async (req, res) => {
  const driverId = req.params.driverId;
  const { isAvailable } = req.body;
  
  try {
    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Conducteur non trouvé' });
    }
    
    driver.is_available = isAvailable;
    await driver.save();
    
    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    console.error('Error updating driver availability:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la disponibilité' });
  }
};
exports.completeTransaction = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Vérifier la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment has not been completed' });
    }

    const {
      user_id,
      amount,
      currency,
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
    } = session.metadata;

    // Création de la transaction
    const transactionData = {
      transaction_id: session.id,
      user_id,
      amount: parseFloat(amount),
      currency,
      payment_method: session.payment_method_types[0]?.toUpperCase() || 'UNKNOWN',
      payment_status: 'SUCCESSFUL',
      transaction_date: new Date()
    };

    const transaction = await transactionService.createTransaction(transactionData);

    // Construire l'objet booking avec toutes les informations
    const booking = {
      departureTime,          // ex: "ven., 14 févr. · 14:30"
      fromAirport,            // ex: "Casablanca Mohammed V Airport (CMN), Casa-Oasis, Nouasseur, Casablanca 8101, Maroc"
      arrivalTime,            // ex: "ven., 14 févr. · 15:56"
      estimatedDuration,      // ex: "86 min"
      toCity,                 // Destination complémentaire
      flightNumber,           // ex: "AA7979"
      vehicleType,            // ex: "Standard"
      passengers,             // ex: "3"
      luggage,                // ex: "3"
      partner,                // ex: "Transferz"
      price: amount,
      currency
    };

    // Optionnel : Vous pouvez notifier le chauffeur ici si nécessaire
    // io.to(user_id).emit('driver_status', { message: 'Votre chauffeur a accepté la course', driver: driverInfo });

    // Renvoyer la transaction et le booking dans la réponse
    res.status(200).json({ transaction, booking, driver: {} });
  } catch (error) {
    console.error('Error in completeTransaction endpoint:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getDriverInfo = async (req, res) => {
  try {
    // Assuming the driver ID is available via req.user.driver_id from your auth middleware
    const driverId = req.user && req.user.driver_id;
    if (!driverId) {
      return res.status(400).json({ error: 'Driver ID missing' });
    }
    const driverInfo = await driverService.getDriverInfo(driverId);
    if (!driverInfo) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.status(200).json(driverInfo);
  } catch (error) {
    console.error('Error in getDriverInfo:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDriverRides = async (req, res) => {
  try {
    // Get driver ID from the authenticated user
    const driverId = req.params.driver_id;
    if (!driverId) {
      return res.status(400).json({ error: 'Driver ID missing' });
    }
    const rides = await driverService.getDriverRides(driverId);
    res.status(200).json(rides);
  } catch (error) {
    console.error('Error in getDriverRides:', error);
    res.status(500).json({ error: error.message });
  }
};
