const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/lectures.controller');

router.get('/', controller.getLectures);

module.exports = router;
