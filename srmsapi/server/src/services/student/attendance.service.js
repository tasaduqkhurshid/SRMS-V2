const StudentPortalService = require('../StudentPortalService');

const getAttendance = async (user) => StudentPortalService.getStudentAttendance(user);

module.exports = { getAttendance };
