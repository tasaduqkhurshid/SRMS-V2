const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/fees.controller');

router.get('/', controller.getFees);

module.exports = router;
