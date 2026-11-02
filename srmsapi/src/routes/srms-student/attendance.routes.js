const express = require('express');
const router = express.Router();
const controller = require('../../controllers/srms-student/attendance.controller');

router.get('/', controller.getAttendance);

module.exports = router;
