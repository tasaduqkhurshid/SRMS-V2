const routes = require("express").Router();
const SchoolController = require("../../controllers/srms-school/SchoolController");
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

// Public route - no authentication required (uses tenant resolution)
routes.get("/brand", SchoolController.getSchoolBrand);

// School admin branding routes (protected) - uses school's own controller
routes.post("/branding/:asset", uploadBrandingImage, SchoolController.uploadBranding);
routes.delete("/branding/:asset", SchoolController.deleteBrandingAsset);

// Protected routes - require authentication
routes.post("/register", SchoolController.register);
routes.get("/me", SchoolController.me);
routes.get("/:id", SchoolController.getById);
routes.put("/:id", SchoolController.update);

module.exports = routes;
