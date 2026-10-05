const AttendanceService = require('../../services/student/attendance.service');

const getAttendance = async (req, res) => {
  try {
    const attendance = await AttendanceService.getAttendance(req.user);
    return res.status(200).json({ status: 'success', data: attendance });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch student attendance', error: error.message });
  }
};

module.exports = { getAttendance };
