const StudentPortalService = require('../StudentPortalService');

const getFees = async (user) => StudentPortalService.getStudentFees(user);

module.exports = { getFees };
