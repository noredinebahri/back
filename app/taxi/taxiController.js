// controllers/taxiController.js

const { v4: uuidv4 } = require('uuid');
const { User, Vehicle, RideBooking, Airport, City, Driver, PricingRule } = require('../booking/booking.model');
const bcrypt = require('bcrypt');
/**
 * Create a new taxi booking
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
// controllers/taxiController.js - Fonction createBooking mise à jour

/**
 * Create a new taxi booking
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createBooking = async (req, res) => {
  try {
    const { 
      pickup_location, 
      dropoff_location, 
      pickup_datetime, 
      pickup_airport_id = "DEFAULT-APT-001",  // Valeur par défaut pour éviter l'erreur null
      dropoff_airport_id = "DEFAULT-APT-002", // Valeur par défaut pour éviter l'erreur null
      pickup_city_id,
      dropoff_city_id,
      vehicle_type,
      passengers,
      luggage,
      flightNumber,
      ride_type,
      currency = 'MAD'
    } = req.body;

    // Vérifier que le nombre de passagers ne dépasse pas 6
    if (passengers > 6) {
      return res.status(400).json({ 
        message: 'Maximum 6 passagers autorisés par véhicule' 
      });
    }

    // Générer un ID unique pour la réservation
    const booking_id = uuidv4();

    // Logique pour obtenir les informations de localisation, avec plusieurs options:
    let fromLocation = null;
    let toLocation = null;
    let distance = 0;
    let realPickupAirportId = pickup_airport_id;
    let realDropoffAirportId = dropoff_airport_id;

    // Déterminer le point de départ
    if (pickup_airport_id && pickup_airport_id !== "DEFAULT-APT-001") {
      fromLocation = await Airport.findByPk(pickup_airport_id);
      if (!fromLocation) {
        return res.status(404).json({ message: "Aéroport de départ non trouvé" });
      }
    } else if (pickup_city_id) {
      fromLocation = await City.findByPk(pickup_city_id);
      if (!fromLocation) {
        return res.status(404).json({ message: "Ville de départ non trouvée" });
      }
      // On utilise un aéroport par défaut car le champ est requis dans le modèle
      realPickupAirportId = "DEFAULT-APT-001"; 
    } else {
      // Essayer de trouver la ville par son nom
      const cityName = pickup_location.split(',')[0].trim();
      fromLocation = await City.findOne({ 
        where: { city_name: cityName } 
      });
      
      if (!fromLocation) {
        return res.status(400).json({ 
          message: "Localisation de départ non reconnue. Veuillez préciser un aéroport_id ou city_id valide." 
        });
      }
      // On utilise un aéroport par défaut car le champ est requis dans le modèle
      realPickupAirportId = "DEFAULT-APT-001";
    }

    // Déterminer le point d'arrivée
    if (dropoff_airport_id && dropoff_airport_id !== "DEFAULT-APT-002") {
      toLocation = await Airport.findByPk(dropoff_airport_id);
      if (!toLocation) {
        return res.status(404).json({ message: "Aéroport d'arrivée non trouvé" });
      }
    } else if (dropoff_city_id) {
      toLocation = await City.findByPk(dropoff_city_id);
      if (!toLocation) {
        return res.status(404).json({ message: "Ville d'arrivée non trouvée" });
      }
      // On utilise un aéroport par défaut car le champ est requis dans le modèle
      realDropoffAirportId = "DEFAULT-APT-002";
    } else {
      // Essayer de trouver la ville par son nom
      const cityName = dropoff_location.split(',')[0].trim();
      toLocation = await City.findOne({ 
        where: { city_name: cityName } 
      });
      
      if (!toLocation) {
        return res.status(400).json({ 
          message: "Localisation d'arrivée non reconnue. Veuillez préciser un aéroport_id ou city_id valide." 
        });
      }
      // On utilise un aéroport par défaut car le champ est requis dans le modèle
      realDropoffAirportId = "DEFAULT-APT-002";
    }

    // Calculer la distance en utilisant la formule de Haversine
    if (fromLocation && toLocation) {
      const lat1 = fromLocation.latitude;
      const lon1 = fromLocation.longitude;
      const lat2 = toLocation.latitude;
      const lon2 = toLocation.longitude;

      // Calcul de la distance (en kilomètres)
      distance = calculateDistance(lat1, lon1, lat2, lon2);
    }

    // Calculer le prix estimé
    const baseFare = 20;
    const perKmFare = 2.5;
    const passengerFare = 5;
    let totalPrice = baseFare + (distance * perKmFare) + (passengers * passengerFare);
    
    // Arrondir le prix à 2 décimales
    totalPrice = Math.round(totalPrice * 100) / 100;

    // Détermine les emplacements de départ et d'arrivée
    const fromName = fromLocation instanceof Airport ? fromLocation.airport_name : fromLocation.city_name;
    const toName = toLocation instanceof Airport ? toLocation.airport_name : toLocation.city_name;

    // Créer l'enregistrement de réservation
    const booking = await RideBooking.create({
      booking_id,
      customer_id: req.user.user_id,
      pickup_location: pickup_location || fromName,
      dropoff_location: dropoff_location || toName,
      pickup_datetime,
      pickup_airport_id: realPickupAirportId,
      dropoff_airport_id: realDropoffAirportId,
      booking_status: 'PENDING',
      ride_type,
      total_distance: distance,
      total_price: totalPrice,
      payment_status: 'PENDING',
      fromAirport: fromLocation instanceof Airport ? fromLocation.airport_name : fromName,
      toCity: toLocation instanceof Airport ? toLocation.city : toName,
      flightNumber,
      vehicleType: vehicle_type,
      passengers,
      luggage,
      currency,
      estimatedDuration: `${Math.round(distance / 60 * 60)} min` // Estimation basée sur 60km/h de moyenne
    });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message
    });
  }
};

/**
 * Calcule la distance entre deux points en km (formule de Haversine)
 */
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
  return distance;
}

function toRad(value) {
  return value * Math.PI / 180;
}
/**
 * Get booking details by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await RideBooking.findByPk(id, {
      include: [
        { model: User, as: 'customer', attributes: ['first_name', 'last_name', 'email', 'phone_number'] },
        { model: User, as: 'driver', attributes: ['first_name', 'last_name', 'email', 'phone_number'] },
        { model: Vehicle, as: 'vehicle' },
        { model: Airport, as: 'pickup_airport' },
        { model: Airport, as: 'dropoff_airport' }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.customer_id !== req.user.user_id && booking.driver_id !== req.user.user_id && req.user.user_type !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error.message
    });
  }
};

/**
 * Get all bookings for the current user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const userType = req.user.user_type;
    
    let bookings;
    
    if (userType === 'CUSTOMER') {
      bookings = await RideBooking.findAll({
        where: { customer_id: userId },
        include: [
          { model: User, as: 'driver', attributes: ['first_name', 'last_name', 'phone_number'] },
          { model: Vehicle, as: 'vehicle' },
          { model: Airport, as: 'pickup_airport' }
        ],
        order: [['pickup_datetime', 'DESC']]
      });
    } else if (userType === 'DRIVER') {
      bookings = await RideBooking.findAll({
        where: { driver_id: userId },
        include: [
          { model: User, as: 'customer', attributes: ['first_name', 'last_name', 'phone_number'] },
          { model: Vehicle, as: 'vehicle' },
          { model: Airport, as: 'pickup_airport' }
        ],
        order: [['pickup_datetime', 'DESC']]
      });
    } else {
      return res.status(403).json({ message: 'Unauthorized user type' });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

/**
 * Register a new vehicle for a driver
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.registerVehicle = async (req, res) => {
  try {
    const { 
      make, 
      model, 
      year, 
      license_plate, 
      vehicle_type, 
      passenger_capacity 
    } = req.body;
    
    const driverId = req.user.user_id;

    // Validate passenger capacity
    if (passenger_capacity > 6) {
      return res.status(400).json({ message: 'Maximum capacity allowed is 6 passengers' });
    }

    // Check if license plate already exists
    const existingVehicle = await Vehicle.findOne({ where: { license_plate } });
    if (existingVehicle) {
      return res.status(400).json({ message: 'Vehicle with this license plate already exists' });
    }

    // Generate a unique vehicle ID
    const vehicle_id = uuidv4();

    // Create the vehicle
    const vehicle = await Vehicle.create({
      vehicle_id,
      driver_id: driverId,
      make,
      model,
      year,
      license_plate,
      vehicle_type,
      passenger_capacity,
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error registering vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register vehicle',
      error: error.message
    });
  }
};

/**
 * Get all vehicles for a driver
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getDriverVehicles = async (req, res) => {
  try {
    const driverId = req.user.user_id;
    
    const vehicles = await Vehicle.findAll({
      where: { driver_id: driverId },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching driver vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
};

/**
 * Update booking status
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const booking = await RideBooking.findByPk(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Cas spécial: un chauffeur accepte une réservation en attente
    if (req.user.user_type === 'DRIVER' && booking.driver_id === null && status === 'CONFIRMED') {
      // Assigner le chauffeur à la réservation
      booking.driver_id = req.user.user_id;
      
      // Récupérer le véhicule du chauffeur (si disponible)
      const vehicle = await Vehicle.findOne({ where: { driver_id: req.user.user_id, is_active: true } });
      if (vehicle) {
        booking.vehicle_id = vehicle.vehicle_id;
      }
      
      booking.booking_status = status;
      await booking.save();
      
      return res.status(200).json({
        success: true,
        message: 'Réservation confirmée et assignée au chauffeur',
        data: booking
      });
    }

    // Vérification d'autorisation standard
    if (req.user.user_type === 'DRIVER' && booking.driver_id !== req.user.user_id) {
      return res.status(403).json({ message: 'You are not authorized to update this booking' });
    }

    if (req.user.user_type === 'CUSTOMER' && booking.customer_id !== req.user.user_id) {
      return res.status(403).json({ message: 'You are not authorized to update this booking' });
    }

    // Update the booking status
    booking.booking_status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

/**
 * Get available drivers near a location
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAvailableDrivers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // Par défaut 10 km
    
    console.log("Paramètres de recherche:", { latitude, longitude, radius });
    
    // Convertir en nombres
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const searchRadius = parseFloat(radius);
    
    console.log("Paramètres convertis:", { lat, lng, searchRadius, typeRadius: typeof searchRadius });
    
    // Récupérer tous les chauffeurs disponibles
    const availableDrivers = await Driver.findAll({
      where: { is_available: true },
      include: [{
        model: Vehicle,
        as: 'driver_vehicle'
      }]
    });
    
    console.log("Nombre de chauffeurs disponibles:", availableDrivers.length);

    // Filtrer les chauffeurs par distance
    const nearbyDrivers = [];
    
    for (const driver of availableDrivers) {
      if (driver.latitude && driver.longitude) {
        const driverLat = parseFloat(driver.latitude);
        const driverLng = parseFloat(driver.longitude);
        
        // Calculer la distance entre le point spécifié et le chauffeur
        const distance = calculateDistance(lat, lng, driverLat, driverLng);
        
        console.log(`Distance pour ${driver.full_name}:`, distance, "km");
        
        // Si le chauffeur est dans le rayon spécifié, l'ajouter à la liste
        console.log(`Rayon de recherche:`, searchRadius, "km");
        console.log(`Distance <= Rayon?`, distance <= searchRadius);
        
        if (distance <= searchRadius) {
          nearbyDrivers.push({
            driver_id: driver.driver_id,
            full_name: driver.full_name,
            distance: distance.toFixed(2), // distance en km avec 2 décimales
            vehicle: driver.driver_vehicle ? {
              make: driver.driver_vehicle.make,
              model: driver.driver_vehicle.model,
              vehicle_type: driver.driver_vehicle.vehicle_type,
              passenger_capacity: driver.driver_vehicle.passenger_capacity
            } : null
          });
        }
      }
    }

    // Trier les chauffeurs par distance (du plus proche au plus éloigné)
    nearbyDrivers.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    res.status(200).json({
      success: true,
      count: nearbyDrivers.length,
      data: nearbyDrivers
    });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available drivers',
      error: error.message
    });
  }
};


/**
 * Rate a driver after a completed ride
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.rateDriver = async (req, res) => {
  try {
    const { booking_id, rating, review_text } = req.body;
    const customerId = req.user.user_id;
    
    // Find the booking
    const booking = await RideBooking.findByPk(booking_id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Ensure booking is completed
    if (booking.booking_status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Can only rate completed rides' });
    }
    
    // Ensure user is the customer of this booking
    if (booking.customer_id !== customerId) {
      return res.status(403).json({ message: 'Not authorized to rate this booking' });
    }

    // Create a rating
    const rating_id = uuidv4();
    const driverRating = await DriverRating.create({
      rating_id,
      booking_id,
      customer_id: customerId,
      driver_id: booking.driver_id,
      rating,
      review_text
    });

    res.status(201).json({
      success: true,
      message: 'Driver rated successfully',
      data: driverRating
    });
  } catch (error) {
    console.error('Error rating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate driver',
      error: error.message
    });
  }
};

/**
 * Get fare estimate for a ride
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
/**
 * Get fare estimate for a ride based on coordinates
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.estimateFare = async (req, res) => {
  try {
    const { 
      // Coordonnées directes
      pickup_lat, pickup_lng,
      dropoff_lat, dropoff_lng,
      
      // Ou identifiants prédéfinis
      pickup_airport_id,
      dropoff_airport_id,
      pickup_city_id,
      dropoff_city_id,
      
      // Ou noms de lieux
      pickup_location,
      dropoff_location,
      
      // Paramètres du trajet
      vehicle_type = 'SEDAN', 
      passengers = 1, 
      luggage = 0 
    } = req.query;

    let fromLat, fromLng, toLat, toLng;
    let fromName, toName;

    // 1. Déterminer les coordonnées de départ
    if (pickup_lat && pickup_lng) {
      // Utiliser directement les coordonnées fournies
      fromLat = parseFloat(pickup_lat);
      fromLng = parseFloat(pickup_lng);
      fromName = "Position personnalisée";
    } else if (pickup_airport_id) {
      // Récupérer les coordonnées de l'aéroport
      const airport = await Airport.findByPk(pickup_airport_id);
      if (!airport) {
        return res.status(404).json({ message: "Aéroport de départ non trouvé" });
      }
      fromLat = parseFloat(airport.latitude);
      fromLng = parseFloat(airport.longitude);
      fromName = airport.airport_name;
    } else if (pickup_city_id) {
      // Récupérer les coordonnées de la ville
      const city = await City.findByPk(pickup_city_id);
      if (!city) {
        return res.status(404).json({ message: "Ville de départ non trouvée" });
      }
      fromLat = parseFloat(city.latitude);
      fromLng = parseFloat(city.longitude);
      fromName = city.city_name;
    } else if (pickup_location) {
      // Essayer de trouver la ville par son nom
      const cityName = pickup_location.split(',')[0].trim();
      const city = await City.findOne({ where: { city_name: cityName } });
      
      if (!city) {
        return res.status(400).json({ 
          message: "Localisation de départ non reconnue. Veuillez préciser des coordonnées valides." 
        });
      }
      fromLat = parseFloat(city.latitude);
      fromLng = parseFloat(city.longitude);
      fromName = city.city_name;
    } else {
      return res.status(400).json({ 
        message: "Veuillez spécifier un point de départ (coordonnées, aéroport, ville)" 
      });
    }
    
    // 2. Déterminer les coordonnées d'arrivée (même logique)
    if (dropoff_lat && dropoff_lng) {
      toLat = parseFloat(dropoff_lat);
      toLng = parseFloat(dropoff_lng);
      toName = "Position personnalisée";
    } else if (dropoff_airport_id) {
      const airport = await Airport.findByPk(dropoff_airport_id);
      if (!airport) {
        return res.status(404).json({ message: "Aéroport d'arrivée non trouvé" });
      }
      toLat = parseFloat(airport.latitude);
      toLng = parseFloat(airport.longitude);
      toName = airport.airport_name;
    } else if (dropoff_city_id) {
      const city = await City.findByPk(dropoff_city_id);
      if (!city) {
        return res.status(404).json({ message: "Ville d'arrivée non trouvée" });
      }
      toLat = parseFloat(city.latitude);
      toLng = parseFloat(city.longitude);
      toName = city.city_name;
    } else if (dropoff_location) {
      const cityName = dropoff_location.split(',')[0].trim();
      const city = await City.findOne({ where: { city_name: cityName } });
      
      if (!city) {
        return res.status(400).json({ 
          message: "Localisation d'arrivée non reconnue. Veuillez préciser des coordonnées valides." 
        });
      }
      toLat = parseFloat(city.latitude);
      toLng = parseFloat(city.longitude);
      toName = city.city_name;
    } else {
      return res.status(400).json({ 
        message: "Veuillez spécifier un point d'arrivée (coordonnées, aéroport, ville)" 
      });
    }

    // 3. Trouver la règle de tarification pour le type de véhicule
    const pricingRule = await PricingRule.findOne({
      where: { vehicle_type },
      order: [['valid_from', 'DESC']]
    });

    let baseFare = 50;
    let perKmRate = 5;
    let peakMultiplier = 1.0;
    if (vehicle_type === 'SEDAN') {
      baseFare = 100;
      perKmRate = 5;
    } else if (vehicle_type === 'SUV') {
      baseFare = 100;
      perKmRate = 5.5;
    } else if (vehicle_type === 'LUXURY') {
      baseFare = 300;
      perKmRate = 6;
    } else if (vehicle_type === 'MINIVAN') {
      baseFare = 400;
      perKmRate = 7;
    }
    if (pricingRule) {
      baseFare = parseFloat(pricingRule.base_fare);
      perKmRate = parseFloat(pricingRule.per_mile_rate);
      peakMultiplier = parseFloat(pricingRule.peak_hour_multiplier || 1.0);
    }

    // 4. Calculer la distance avec la formule de Haversine
    const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
    
    // 5. Calculer le tarif
    let totalFare = baseFare + (distance * perKmRate);
    
    // Appliquer un supplément pour passagers supplémentaires
    if (passengers > 2) {
      totalFare += (passengers - 2) * 5; // 5 MAD par passager supplémentaire au-delà de 2
    }
    
    // Appliquer un supplément pour bagages supplémentaires
    if (luggage > 1) {
      totalFare += (luggage - 1) * 3; // 3 MAD par bagage supplémentaire au-delà de 1
    }
    
    // Appliquer le multiplicateur d'heure de pointe si nécessaire
    // (cette logique peut être améliorée pour vérifier si l'heure actuelle est une heure de pointe)
    const currentHour = new Date().getHours();
    const isPeakHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);
    
    if (isPeakHour) {
      totalFare = totalFare * peakMultiplier;
    }
    
    // Arrondir à 2 décimales
    totalFare = Math.round(totalFare * 100) / 100;

    // Calculer la durée estimée (basée sur une vitesse moyenne de 60 km/h)
    const estimatedDuration = Math.round(distance / 60 * 60);

    res.status(200).json({
      success: true,
      data: {
        from: fromName,
        to: toName,
        from_coordinates: { lat: fromLat, lng: fromLng },
        to_coordinates: { lat: toLat, lng: toLng },
        base_fare: baseFare,
        distance_fare: parseFloat((distance * perKmRate).toFixed(2)),
        passenger_surcharge: passengers > 2 ? (passengers - 2) * 5 : 0,
        luggage_surcharge: luggage > 1 ? (luggage - 1) * 3 : 0,
        peak_hour_applied: isPeakHour,
        peak_multiplier: isPeakHour ? peakMultiplier : 1.0,
        total_fare: totalFare,
        currency: 'MAD',
        distance: distance,
        unit: 'km',
        estimated_duration: `${estimatedDuration} min`,
        vehicle_type: vehicle_type
      }
    });
  } catch (error) {
    console.error('Error calculating fare estimate:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du calcul de l'estimation du tarif",
      error: error.message
    });
  }
};

/**
 * Ajouter des chauffeurs de test
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.addTestDrivers = async (req, res) => {
  try {
    // Chauffeurs à moins de 500 mètres
    const testDrivers = [
      {
        driver_id: "DRV-002",
        full_name: "Fatima Benani",
        email: "fatima.b@example.com",
        phone_number: "+212622222222",
        latitude: 33.5731104,
        longitude: -7.5888434, // ~89 mètres à l'est
        is_available: true,
        vehicle: { 
          make: "Honda", 
          model: "Accord", 
          vehicle_type: "SEDAN",
          year: 2021,
          license_plate: "B-222-33",
          passenger_capacity: 4
        }
      },
      {
        driver_id: "DRV-003",
        full_name: "Karim Tazi",
        email: "karim.t@example.com",
        phone_number: "+212633333333",
        latitude: 33.5721104, // ~111 mètres au sud
        longitude: -7.5898434,
        is_available: true,
        vehicle: { 
          make: "Hyundai", 
          model: "Tucson", 
          vehicle_type: "SUV",
          year: 2023,
          license_plate: "C-333-44",
          passenger_capacity: 5
        }
      },
      {
        driver_id: "DRV-004",
        full_name: "Saida Oufkir",
        email: "saida.o@example.com",
        phone_number: "+212644444444",
        latitude: 33.5735104, // ~44 mètres au nord
        longitude: -7.5902434, // ~35 mètres à l'ouest
        is_available: true,
        vehicle: { 
          make: "Mercedes", 
          model: "E-Class", 
          vehicle_type: "LUXURY",
          year: 2023,
          license_plate: "D-444-55",
          passenger_capacity: 4
        }
      },
      {
        driver_id: "DRV-005",
        full_name: "Youssef Alaoui",
        email: "youssef.a@example.com",
        phone_number: "+212655555555",
        latitude: 33.5781104, // ~556 mètres au nord
        longitude: -7.5898434,
        is_available: true,
        vehicle: { 
          make: "Ford", 
          model: "Explorer", 
          vehicle_type: "SUV",
          year: 2022,
          license_plate: "E-555-66",
          passenger_capacity: 6
        }
      },
      {
        driver_id: "DRV-006",
        full_name: "Nadia Chaoui",
        email: "nadia.c@example.com",
        phone_number: "+212666666666",
        latitude: 33.5731104,
        longitude: -7.5848434, // ~443 mètres à l'est
        is_available: true,
        vehicle: { 
          make: "Kia", 
          model: "Sportage", 
          vehicle_type: "SUV",
          year: 2021,
          license_plate: "F-666-77",
          passenger_capacity: 5
        }
      }
      // Ajoutez les 5 autres chauffeurs ici...
    ];

    const addedDrivers = [];

    for (const driverData of testDrivers) {
      try {
        // Générer un ID unique pour l'utilisateur/chauffeur
        const userId = uuidv4();
        
        // 1. Créer l'utilisateur avec le rôle DRIVER
        const hashedPassword = await bcrypt.hash('Password123', 10);
        
        const user = await User.create({
          user_id: userId,
          first_name: driverData.full_name.split(' ')[0],
          last_name: driverData.full_name.split(' ')[1] || '',
          email: driverData.email,
          phone_number: driverData.phone_number,
          password_hash: hashedPassword,
          user_type: 'DRIVER',
          is_verified: true,
          is_active: true
        });

        // 2. Créer le chauffeur
        const driver = await Driver.create({
          driver_id: userId,
          full_name: driverData.full_name,
          email: driverData.email,
          phone_number: driverData.phone_number,
          latitude: driverData.latitude,
          longitude: driverData.longitude,
          is_available: true
        });

        // 3. Créer le véhicule
        if (driverData.vehicle) {
          const vehicleId = uuidv4();
          const vehicle = await Vehicle.create({
            vehicle_id: vehicleId,
            driver_id: userId,
            make: driverData.vehicle.make,
            model: driverData.vehicle.model,
            year: driverData.vehicle.year,
            license_plate: driverData.vehicle.license_plate,
            vehicle_type: driverData.vehicle.vehicle_type,
            passenger_capacity: driverData.vehicle.passenger_capacity,
            is_active: true
          });
          
          // 4. Mettre à jour le champ vehicle_id dans le driver
          await Driver.update(
            { vehicle_id: vehicleId },
            { where: { driver_id: userId } }
          );
        }

        addedDrivers.push({
          id: userId,
          full_name: driverData.full_name,
          email: driverData.email,
          latitude: driverData.latitude,
          longitude: driverData.longitude
        });
      } catch (innerError) {
        console.error(`Error adding driver ${driverData.full_name}:`, innerError);
        // Continue avec le prochain chauffeur même si celui-ci échoue
      }
    }

    res.status(201).json({
      success: true,
      message: 'Chauffeurs de test ajoutés avec succès',
      count: addedDrivers.length,
      data: addedDrivers
    });
  } catch (error) {
    console.error('Error adding test drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout des chauffeurs de test',
      error: error.message
    });
  }
};