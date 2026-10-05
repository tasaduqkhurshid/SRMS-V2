const router = require('express').Router();
const controller = require('../controllers/platformSchoolController');
const brandingController = require('../controllers/platformBrandingController');
const multer = require('multer');

const allowedBrandingTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const brandingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(
    allowedBrandingTypes.has(file.mimetype)
      ? null
      : new Error('Only JPEG, PNG, and WebP images are allowed'),
    allowedBrandingTypes.has(file.mimetype),
  ),
}).single('file');

const uploadBrandingImage = (req, res, next) => brandingUpload(req, res, (error) => {
  if (!error) return next();
  const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
  return res.status(status).json({ success: false, message: status === 413 ? 'Branding images must be 5 MB or smaller' : error.message });
});

router.get('/schools', controller.list);
router.post('/schools', controller.create);
router.get('/schools/:id', controller.getOne);
router.patch('/schools/:id', controller.update);
router.get('/schools/:id/admins', controller.listAdministrators);
router.post('/schools/:id/admins', controller.createAdministrator);
router.patch('/schools/:id/admins/:adminId/password', controller.updateAdministratorPassword);
router.post('/schools/:schoolId/branding/:asset', uploadBrandingImage, brandingController.uploadBranding);

module.exports = router;
