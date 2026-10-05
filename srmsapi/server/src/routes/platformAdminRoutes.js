const router = require('express').Router();
const controller = require('../controllers/platformSchoolController');

router.get('/schools', controller.list);
router.post('/schools', controller.create);
router.get('/schools/:id', controller.getOne);
router.patch('/schools/:id', controller.update);
router.get('/schools/:id/admins', controller.listAdministrators);
router.post('/schools/:id/admins', controller.createAdministrator);

module.exports = router;