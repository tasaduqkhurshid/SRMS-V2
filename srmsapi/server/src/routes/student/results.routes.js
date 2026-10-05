const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/results.controller');

router.get('/', controller.getResults);

module.exports = router;
