const CourseService = require("../services/CourseService");
const { STATUS } = require("../constants/status");
const logger = require("../utils/logger");

const listCourses = async (req, res) => {
  try {
    const params = { page: req.query.page, limit: req.query.limit, query: req.query.q };
    const result = await CourseService.listCourses(params);
    return res.status(STATUS.OK).json({ status: "success", data: result });
  } catch (err) {
    logger && logger.error && logger.error("listCourses error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to list courses", error: err.message });
  }
};

/**
 * Get all courses for select dropdowns (cached)
 */
const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseService.getAllCourses();
    return res.status(STATUS.OK).json({ status: "success", data: courses });
  } catch (err) {
    logger && logger.error && logger.error("getAllCourses error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch courses", error: err.message });
  }
};

const getCourse = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "course id is required" });
    const course = await CourseService.getCourse(id);
    if (!course) return res.status(STATUS.NOT_FOUND).json({ status: "error", message: "Course not found" });
    return res.status(STATUS.OK).json({ status: "success", data: course });
  } catch (err) {
    logger && logger.error && logger.error("getCourse error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch course", error: err.message });
  }
};

const saveCourse = async (req, res) => {
  try {
    const payload = req.body || {};
    const id = payload.id || null;
    let result;
    if (id) result = await CourseService.updateCourse(id, payload);
    else result = await CourseService.createCourse(payload);
    return res.status(STATUS.OK).json({ status: "success", data: result });
  } catch (err) {
    logger && logger.error && logger.error("saveCourse error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to save course", error: err.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "course id is required" });
    await CourseService.deleteCourse(id);
    return res.status(STATUS.OK).json({ status: "success" });
  } catch (err) {
    logger && logger.error && logger.error("deleteCourse error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to delete course", error: err.message });
  }
};

const listCourseSubjects = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "course id is required" });
    const rows = await CourseService.getCourseSubjects(id);
    // If client requests flat subjects (simpler shape for UI), map to inner subject objects
    if (req.query && (req.query.flat === '1' || req.query.flat === 'true')) {
      const subjects = (Array.isArray(rows) ? rows.map(r => (r && r.subject) ? r.subject : r) : []);
      return res.status(STATUS.OK).json({ status: "success", data: subjects });
    }
    return res.status(STATUS.OK).json({ status: "success", data: rows });
  } catch (err) {
    logger && logger.error && logger.error("listCourseSubjects error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch course subjects", error: err.message });
  }
};

const setCourseSubjects = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};
    const subjectIds = Array.isArray(payload.subject_ids) ? payload.subject_ids : (payload.subjectIds || []);
    const schoolId = req.user ? (req.user.school_id || req.user.SchoolId || req.user.schoolId || null) : null;
    const result = await CourseService.setCourseSubjects(id, subjectIds, schoolId);
    return res.status(STATUS.OK).json({ status: "success", data: result });
  } catch (err) {
    logger && logger.error && logger.error("setCourseSubjects error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to set course subjects", error: err.message });
  }
};

module.exports = { listCourses, getAllCourses, getCourse, saveCourse, deleteCourse, listCourseSubjects, setCourseSubjects };
