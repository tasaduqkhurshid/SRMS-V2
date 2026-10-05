const StudentPortalService = require('../StudentPortalService');

const getResults = async (user) => StudentPortalService.getStudentResults(user);

module.exports = { getResults };
