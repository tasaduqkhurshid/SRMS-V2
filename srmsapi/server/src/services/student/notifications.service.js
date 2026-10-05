const StudentPortalService = require('../StudentPortalService');

const getNotifications = async (user) => StudentPortalService.getStudentNotifications(user);

module.exports = { getNotifications };
