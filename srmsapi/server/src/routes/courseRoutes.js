const router = require('express').Router();
const CourseController = require('../controllers/CourseController');

// list & search (paginated)
router.get('/', CourseController.listCourses);
// create/update
router.post('/save', CourseController.saveCourse);
// get detail
router.get('/:id', CourseController.getCourse);
// delete
router.delete('/:id', CourseController.deleteCourse);

// course subjects
router.get('/:id/subjects', CourseController.listCourseSubjects);
router.post('/:id/subjects', CourseController.setCourseSubjects);

module.exports = router;
