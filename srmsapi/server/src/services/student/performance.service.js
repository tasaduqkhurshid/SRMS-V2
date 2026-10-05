const StudentPortalService = require('../StudentPortalService');

const getPerformance = async (user) => StudentPortalService.getStudentPerformance(user);

module.exports = { getPerformance };
