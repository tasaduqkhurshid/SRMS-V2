const express = require('express');
const router = express.Router();
const AcademicYearController = require('../controllers/AcademicYearController');

router.get('/all', AcademicYearController.getAllAcademicYears);
router.get('/', AcademicYearController.list);
router.get('/:id', AcademicYearController.get);
router.post('/save', AcademicYearController.save);
router.delete('/:id', AcademicYearController.remove);

module.exports = router;
