const StudentPortalService = require('../StudentPortalService');

const getProfile = async (user) => StudentPortalService.getStudentProfile(user);

module.exports = { getProfile };
