// dashboard.service.js
const dashboardRepository = require('./dashboard.repository');

exports.getNotifications = async (userId) => {
  return await dashboardRepository.getNotifications(userId);
};

exports.getAccountSummary = async (userId) => {
  return await dashboardRepository.getAccountSummary(userId);
};
