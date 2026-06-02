const router = require('express').Router();
const CourseController = require('../controllers/CourseController');
const ExamController = require('../controllers/ExamController');
const SubjectController = require('../controllers/SubjectController');
const AcademicYearController = require('../controllers/AcademicYearController');
const logger = require('../utils/logger');

/**
 * Dynamic Option Routes
 * Provides cached endpoints for select dropdowns and dynamic option lists
 * These routes return all items in a category without pagination, cached in Redis
 */

// Courses options
router.get('/courses/all', async (req, res, next) => {
  try {
    logger.debug('Fetching all courses from cache');
    await CourseController.getAllCourses(req, res);
  } catch (err) {
    logger.error('Error in /courses/all:', err.message);
    next(err);
  }
});

// Exams options
router.get('/exams/all', async (req, res, next) => {
  try {
    logger.debug('Fetching all exams from cache');
    await ExamController.getAllExams(req, res);
  } catch (err) {
    logger.error('Error in /exams/all:', err.message);
    next(err);
  }
});

// Subjects options
router.get('/subjects/all', async (req, res, next) => {
  try {
    logger.debug('Fetching all subjects from cache');
    await SubjectController.getAllSubjects(req, res);
  } catch (err) {
    logger.error('Error in /subjects/all:', err.message);
    next(err);
  }
});

// Academic Years options
router.get('/academic-years/all', async (req, res, next) => {
  try {
    logger.debug('Fetching all academic years from cache');
    await AcademicYearController.getAllAcademicYears(req, res);
  } catch (err) {
    logger.error('Error in /academic-years/all:', err.message);
    next(err);
  }
});

module.exports = router;
