// controllers/pickupController.js

const { v4: uuidv4 } = require('uuid');
const { User, RideBooking, PickupPoint, PricingDistance } = require('../booking/booking.model');

/**
 * Ajouter un point de ramassage à une réservation existante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.addPickupPoint = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { 
      passenger_name, 
      passenger_phone, 
      passenger_email,
      latitude,
      longitude,
      pickup_time
    } = req.body;

    // Vérifier si la réservation existe
    const booking = await RideBooking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Réservation non trouvée' 
      });
    }

    // Vérifier si le chauffeur est assigné à la réservation
    if (!booking.driver_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun chauffeur assigné à cette réservation' 
      });
    }

    // Vérifier le nombre de passagers déjà dans la réservation
    const existingPickupPoints = await PickupPoint.findAll({ 
      where: { booking_id, pickup_status: ['PENDING', 'CONFIRMED', 'PICKED_UP'] } 
    });

    // Ajouter +1 pour le passager principal
    if (existingPickupPoints.length + 1 >= 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre maximum de passagers atteint (6)' 
      });
    }

    // Calculer la distance depuis le point de départ
    const startLat = parseFloat(booking.pickup_airport.latitude || booking.latitude);
    const startLng = parseFloat(booking.pickup_airport.longitude || booking.longitude);
    const endLat = parseFloat(booking.dropoff_airport.latitude || booking.latitude);
    const endLng = parseFloat(booking.dropoff_airport.longitude || booking.longitude);
    
    // Calculer la distance totale du trajet
    const totalDistance = calculateDistance(startLat, startLng, endLat, endLng);
    
    // Calculer la distance depuis le point de départ jusqu'au point de ramassage
    const distanceFromStart = calculateDistance(startLat, startLng, parseFloat(latitude), parseFloat(longitude));
    
    // Calculer le pourcentage du trajet total
    const percentOfTotalDistance = (distanceFromStart / totalDistance) * 100;
    
    // Récupérer les règles de tarification du chauffeur
    const pricingRules = await PricingDistance.findAll({
      where: { 
        driver_id: booking.driver_id,
        is_active: true
      },
      order: [['min_percent_distance', 'ASC']]
    });

    // Si aucune règle n'est trouvée, utiliser des valeurs par défaut
    let pricePercentage = 100;
    
    // Déterminer le pourcentage de prix à appliquer
    // D'abord, vérifier si c'est dans une proximité de 3 km
    const proximityRule = pricingRules.find(rule => 
      rule.min_percent_distance === 0 && rule.max_percent_distance === 3
    );
    
    if (proximityRule && distanceFromStart <= 3) {
      pricePercentage = parseFloat(proximityRule.price_percentage);
    } else {
      // Sinon, trouver la règle basée sur le pourcentage du trajet
      for (const rule of pricingRules) {
        if (percentOfTotalDistance >= parseFloat(rule.min_percent_distance) && 
            percentOfTotalDistance <= parseFloat(rule.max_percent_distance)) {
          pricePercentage = parseFloat(rule.price_percentage);
          break;
        }
      }
    }
    
    // Calculer le montant à payer
    const priceAmount = (booking.total_price * pricePercentage) / 100;
    
    // Créer le point de ramassage
    const pickupPointId = uuidv4();
    const pickupPoint = await PickupPoint.create({
      pickup_point_id: pickupPointId,
      booking_id,
      passenger_name,
      passenger_phone,
      passenger_email,
      latitude,
      longitude,
      distance_from_start: distanceFromStart,
      percent_of_total_distance: percentOfTotalDistance,
      price_percentage: pricePercentage,
      price_amount: priceAmount,
      pickup_status: 'PENDING',
      pickup_time: pickup_time || null
    });
    
    res.status(201).json({
      success: true,
      message: 'Point de ramassage ajouté avec succès',
      data: {
        pickup_point: pickupPoint,
        total_distance: totalDistance,
        distance_from_start: distanceFromStart,
        percent_of_total_distance: percentOfTotalDistance,
        applied_price_percentage: pricePercentage,
        price_amount: priceAmount
      }
    });
  } catch (error) {
    console.error('Error adding pickup point:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du point de ramassage',
      error: error.message
    });
  }
};

/**
 * Récupérer tous les points de ramassage pour une réservation
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getBookingPickupPoints = async (req, res) => {
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
    
    // Vérifier l'autorisation (seul le client, le chauffeur ou l'admin peuvent voir les points de ramassage)
    if (booking.customer_id !== req.user.user_id && 
        booking.driver_id !== req.user.user_id && 
        req.user.user_type !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Non autorisé à voir les points de ramassage de cette réservation' 
      });
    }
    
    // Récupérer tous les points de ramassage
    const pickupPoints = await PickupPoint.findAll({
      where: { booking_id },
      order: [['percent_of_total_distance', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: pickupPoints.length,
      data: pickupPoints
    });
  } catch (error) {
    console.error('Error fetching pickup points:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des points de ramassage',
      error: error.message
    });
  }
};

/**
 * Mettre à jour le statut d'un point de ramassage
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updatePickupStatus = async (req, res) => {
  try {
    const { booking_id, pickup_point_id } = req.params;
    const { pickup_status } = req.body;
    
    // Vérifier si le statut est valide
    const validStatuses = ['PENDING', 'CONFIRMED', 'PICKED_UP', 'CANCELLED'];
    if (!validStatuses.includes(pickup_status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Statut invalide' 
      });
    }
    
    // Vérifier si le point de ramassage existe
    const pickupPoint = await PickupPoint.findOne({
      where: { pickup_point_id, booking_id }
    });
    
    if (!pickupPoint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Point de ramassage non trouvé' 
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
    
    // Vérifier l'autorisation (seul le chauffeur ou l'admin peuvent mettre à jour le statut)
    if (booking.driver_id !== req.user.user_id && req.user.user_type !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Non autorisé à mettre à jour le statut de ce point de ramassage' 
      });
    }
    
    // Mettre à jour le statut
    pickupPoint.pickup_status = pickup_status;
    
    // Si le statut est PICKED_UP, enregistrer l'heure de ramassage
    if (pickup_status === 'PICKED_UP' && !pickupPoint.pickup_time) {
      pickupPoint.pickup_time = new Date();
    }
    
    await pickupPoint.save();
    
    res.status(200).json({
      success: true,
      message: 'Statut du point de ramassage mis à jour avec succès',
      data: pickupPoint
    });
  } catch (error) {
    console.error('Error updating pickup status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut du point de ramassage',
      error: error.message
    });
  }
};

/**
 * Supprimer un point de ramassage
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deletePickupPoint = async (req, res) => {
  try {
    const { booking_id, pickup_point_id } = req.params;
    
    // Vérifier si le point de ramassage existe
    const pickupPoint = await PickupPoint.findOne({
      where: { pickup_point_id, booking_id }
    });
    
    if (!pickupPoint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Point de ramassage non trouvé' 
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
    
    // Vérifier l'autorisation (seul le client, le chauffeur ou l'admin peuvent supprimer)
    if (booking.customer_id !== req.user.user_id && 
        booking.driver_id !== req.user.user_id && 
        req.user.user_type !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Non autorisé à supprimer ce point de ramassage' 
      });
    }
    
    // Empêcher la suppression si le statut est PICKED_UP
    if (pickupPoint.pickup_status === 'PICKED_UP') {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible de supprimer un point de ramassage déjà effectué' 
      });
    }
    
    // Supprimer le point de ramassage
    await pickupPoint.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Point de ramassage supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting pickup point:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du point de ramassage',
      error: error.message
    });
  }
};

/**
 * Définir les règles de tarification pour un chauffeur
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.setDriverPricingRules = async (req, res) => {
  try {
    const driverId = req.user.user_id;
    const { pricingRules } = req.body;
    
    // Vérifier que l'utilisateur est bien un chauffeur
    if (req.user.user_type !== 'DRIVER') {
      return res.status(403).json({ 
        success: false, 
        message: 'Seuls les chauffeurs peuvent définir des règles de tarification' 
      });
    }
    
    // Valider les règles de tarification
    if (!Array.isArray(pricingRules) || pricingRules.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les règles de tarification doivent être un tableau non vide' 
      });
    }
    
    // Vérifier les chevauchements et les valeurs négatives
    for (let i = 0; i < pricingRules.length; i++) {
      const rule = pricingRules[i];
      
      if (rule.min_percent_distance < 0 || rule.max_percent_distance > 100 || 
          rule.min_percent_distance > rule.max_percent_distance) {
        return res.status(400).json({ 
          success: false, 
          message: 'Règle de tarification invalide: les pourcentages doivent être entre 0 et 100, et min <= max' 
        });
      }
      
      if (rule.price_percentage < 0 || rule.price_percentage > 100) {
        return res.status(400).json({ 
          success: false, 
          message: 'Règle de tarification invalide: le pourcentage de prix doit être entre 0 et 100' 
        });
      }
      
      // Vérifier les chevauchements avec d'autres règles
      for (let j = 0; j < pricingRules.length; j++) {
        if (i !== j) {
          const otherRule = pricingRules[j];
          if ((rule.min_percent_distance <= otherRule.max_percent_distance && 
               rule.max_percent_distance >= otherRule.min_percent_distance) &&
              !(rule.min_percent_distance === 0 && rule.max_percent_distance === 3)) { // Exception pour la règle de proximité
            return res.status(400).json({ 
              success: false, 
              message: 'Règles de tarification avec des plages qui se chevauchent' 
            });
          }
        }
      }
    }
    
    // Supprimer les règles existantes
    await PricingDistance.destroy({
      where: { driver_id: driverId }
    });
    
    // Créer les nouvelles règles
    const createdRules = [];
    for (const rule of pricingRules) {
      const newRule = await PricingDistance.create({
        pricing_distance_id: uuidv4(),
        driver_id: driverId,
        min_percent_distance: rule.min_percent_distance,
        max_percent_distance: rule.max_percent_distance,
        price_percentage: rule.price_percentage,
        is_active: true
      });
      
      createdRules.push(newRule);
    }
    
    res.status(201).json({
      success: true,
      message: 'Règles de tarification définies avec succès',
      data: createdRules
    });
  } catch (error) {
    console.error('Error setting pricing rules:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la définition des règles de tarification',
      error: error.message
    });
  }
};

/**
 * Récupérer les règles de tarification d'un chauffeur
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getDriverPricingRules = async (req, res) => {
  try {
    const { driver_id } = req.params;
    
    // Si pas de driver_id spécifié, utiliser l'ID de l'utilisateur connecté
    const driverId = driver_id || req.user.user_id;
    
    // Vérifier que l'utilisateur a le droit de voir ces règles
    if (driverId !== req.user.user_id && req.user.user_type !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Non autorisé à voir les règles de tarification de ce chauffeur' 
      });
    }
    
    // Récupérer les règles
    const pricingRules = await PricingDistance.findAll({
      where: { driver_id: driverId, is_active: true },
      order: [['min_percent_distance', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: pricingRules.length,
      data: pricingRules
    });
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des règles de tarification',
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
  return Math.round(distance * 100) / 100; // Arrondi à 2 décimales
}

function toRad(value) {
  return value * Math.PI / 180;
}