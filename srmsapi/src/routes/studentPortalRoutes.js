const express = require('express');
const router = express.Router();

router.use('/', require('./student'));

module.exports = router;
