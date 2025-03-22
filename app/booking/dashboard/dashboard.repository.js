// dashboard.repository.js
const { Notification, RideBooking, Transaction } = require('../booking.model'); // Assurez-vous que le chemin est correct

exports.getNotifications = async (userId) => {
  try {
    // Récupérer les notifications pour l'utilisateur, triées par date décroissante
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']]
    });
    return notifications;
  } catch (error) {
    console.error('Error in getNotifications repository:', error);
    throw error;
  }
};

exports.getAccountSummary = async (userId) => {
  try {
    // Calculer le nombre de réservations
    const totalBookings = await RideBooking.count({
      where: { customer_id: userId }
    });

    // Récupérer toutes les transactions réussies pour cet utilisateur
    const transactions = await Transaction.findAll({
      where: { user_id: userId, payment_status: 'SUCCESSFUL' }
    });

    // Calculer le total dépensé (en supposant que le champ amount est de type numérique ou convertible en nombre)
    const totalSpent = transactions.reduce((sum, txn) => sum + parseFloat(txn.amount), 0);

    // Déduire la devise à partir de la première transaction (ou définir une valeur par défaut)
    const currency = transactions.length ? transactions[0].currency : 'USD';

    return { totalBookings, totalSpent, currency };
  } catch (error) {
    console.error('Error in getAccountSummary repository:', error);
    throw error;
  }
};
