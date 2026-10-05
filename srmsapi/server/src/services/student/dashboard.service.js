const StudentPortalService = require('../StudentPortalService');

const getDashboard = async (user) => StudentPortalService.getStudentDashboard(user);

module.exports = { getDashboard };
