const router = require("express").Router();
const {
  listSubjects,
  saveSubject,
  getSubjectDetails,
  updateSubject,
  deleteSubject,
} = require("../controllers/SubjectController");

// List + search + paginate
router.get("/", listSubjects);

// Create (save supports create and update by subjectId)
router.post("/save", saveSubject);

// Get details
router.get("/:id/details", getSubjectDetails);

// Update
router.put("/:id", updateSubject);

// Delete
router.delete("/:id", deleteSubject);

module.exports = router;
