// dashboard.route.js
const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../user/middleware/authMiddleware');

// Endpoint pour récupérer les notifications du client
router.get('/notifications/:userId', authMiddleware, dashboardController.getNotifications);

// Endpoint pour récupérer le résumé du compte du client
router.get('/account-summary/:userId', authMiddleware, dashboardController.getAccountSummary);

module.exports = router;
