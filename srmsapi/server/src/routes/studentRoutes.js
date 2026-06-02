// routes/student.routes.js
const router = require("express").Router();
const multer = require("multer");
const PwpConstants = require("../constants/PwpConstants");

// Use memory storage for BLOB saving
// File size limit based on STUDENT image entity configuration from PwpConstants
const studentImageConfig = PwpConstants.getImageEntity('STUDENT');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: studentImageConfig.maxSize }, // 5MB from PwpConstants
});

// Import controller methods
const StudentController = require("../controllers/StudentController");

// ---------- Student Routes ----------

// List + search + paginate
router.get("/", StudentController.listStudents);
// List students by class/course id
router.get('/class/:id', StudentController.listStudentsByClass);

// Bulk import students from file
router.post("/import", upload.single("file"), StudentController.bulkImportStudents);

// Create
router.post("/save", StudentController.saveStudentDetails);

// Student details + image (base64)
router.get("/:id/details", StudentController.getStudentDetails);

// Student subjects: list and set
router.get("/:id/subjects", StudentController.listStudentSubjects);
router.post("/:id/subjects", StudentController.setStudentSubjects);
router.post("/:id/course", StudentController.setStudentCourse);
// Update
router.put("/:id", StudentController.updateStudent);

// Delete
router.delete("/:id", StudentController.deleteStudent);

// Upload student image (multer memoryStorage)
router.post(
  "/:id/image",
  upload.single("photo"),  // "photo" is your frontend field name
  StudentController.uploadStudentImage
);

module.exports = router;
