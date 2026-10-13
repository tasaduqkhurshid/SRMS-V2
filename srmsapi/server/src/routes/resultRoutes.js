const express = require('express');
const router = express.Router();
const ResultController = require('../controllers/ResultController');

router.get('/', ResultController.listResults);
router.get('/:id', ResultController.getResult);
router.post('/save', ResultController.saveResult);
router.post('/save-class-result', ResultController.bulkSaveResults);
router.post('/generate-marksheet', ResultController.generateMarksheet);
router.delete('/:id', ResultController.deleteResult);

module.exports = router;