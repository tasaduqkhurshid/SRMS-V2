const express = require('express');
const router = express.Router();
const controller = require('../../controllers/srms-student/results.controller');

router.get('/', controller.getResults);

module.exports = router;
