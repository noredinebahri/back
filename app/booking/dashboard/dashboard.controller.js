// dashboard.controller.js
const dashboardService = require('./dashboard.service');

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await dashboardService.getNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAccountSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const summary = await dashboardService.getAccountSummary(userId);
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching account summary:', error);
    res.status(500).json({ error: error.message });
  }
};
