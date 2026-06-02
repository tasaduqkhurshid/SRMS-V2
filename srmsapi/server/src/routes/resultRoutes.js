const express = require('express');
const router = express.Router();
const ResultController = require('../controllers/ResultController');

router.get('/', ResultController.list);
router.get('/:id', ResultController.get);
router.post('/save', ResultController.save);
router.post('/save-class-result', ResultController.bulkSave);
router.post('/generate-marksheet', ResultController.generateMarksheet);
router.delete('/:id', ResultController.remove);

module.exports = router;
