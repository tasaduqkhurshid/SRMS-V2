const express = require('express');
const router = express.Router();

router.use('/', require('./srms-student'));

module.exports = router;
