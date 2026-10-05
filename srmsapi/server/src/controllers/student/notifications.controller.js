const NotificationsService = require('../../services/student/notifications.service');

const getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationsService.getNotifications(req.user);
    return res.status(200).json({ status: 'success', data: notifications });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch notifications', error: error.message });
  }
};

module.exports = { getNotifications };
