const express = require('express');
const router = express.Router();
const controller = require('../../controllers/srms-student/performance.controller');

router.get('/', controller.getPerformance);

module.exports = router;
