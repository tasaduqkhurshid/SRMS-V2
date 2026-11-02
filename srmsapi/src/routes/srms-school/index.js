const express = require('express');
const router = express.Router();

const schoolRoutes = require('./schoolRoutes');
const studentRoutes = require('./studentRoutes');
const subjectRoutes = require('./subjectRoutes');
const courseRoutes = require('./courseRoutes');
const examRoutes = require('./examRoutes');
const academicYearRoutes = require('./academicYearRoutes');
const resultRoutes = require('./resultRoutes');
const marksheetTemplateRoutes = require('./marksheetTemplateRoutes');
const feeRoutes = require('./feeRoutes');
const dynamicOptionRoutes = require('./DynamicOptionRoutes');
const supportTicketRoutes = require('./supportTicketRoutes');

router.use('/school', schoolRoutes);
router.use('/students', studentRoutes);
router.use('/subjects', subjectRoutes);
router.use('/courses', courseRoutes);
router.use('/exams', examRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/results', resultRoutes);
router.use('/marksheet-templates', marksheetTemplateRoutes);
router.use('/fees', feeRoutes);
router.use('/options', dynamicOptionRoutes);
router.use('/support-tickets', supportTicketRoutes);

module.exports = router;