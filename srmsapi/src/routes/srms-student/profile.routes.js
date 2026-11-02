const express = require('express');
const router = express.Router();
const controller = require('../../controllers/srms-student/profile.controller');

router.get('/', controller.getProfile);

module.exports = router;
