const express = require('express');
const router = express.Router();
const AcademicYearController = require('../controllers/AcademicYearController');

router.get('/all', AcademicYearController.getAllAcademicYears);
router.get('/', AcademicYearController.listAcademicYears);
router.get('/:id', AcademicYearController.getAcademicYear);
router.post('/save', AcademicYearController.saveAcademicYear);
router.delete('/:id', AcademicYearController.deleteAcademicYear);

module.exports = router;