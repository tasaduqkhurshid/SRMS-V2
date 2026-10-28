const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/attendance.controller');

router.get('/', controller.getAttendance);

module.exports = router;
