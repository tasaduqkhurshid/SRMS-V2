const SubjectService = require("../services/SubjectService");
const { STATUS } = require("../constants/status");
const logger  = require("../utils/logger");

/**
 * Controller for subjects
 */
const listSubjects = async (req, res) => {
  try {
    const reqParams = { ...req.query, ...req.body, ...req.params };
    logger && logger.debug && logger.debug("listSubjects reqParams:", reqParams);

    const page = Number(reqParams.page || 1);
    const limit = Number(reqParams.limit || 20);
    const query = reqParams.q || reqParams.query || "";

    const result = await SubjectService.listSubjects({ page, limit, query });

    return res.status(STATUS.OK).json({ status: "success", data: result });
  } catch (err) {
    logger && logger.error && logger.error("listSubjects controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to list subjects", error: err.message });
  }
};

/**
 * Get all subjects for select dropdowns (cached)
 */
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await SubjectService.getAllSubjects();
    return res.status(STATUS.OK).json({ status: "success", data: subjects });
  } catch (err) {
    logger && logger.error && logger.error("getAllSubjects controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch subjects", error: err.message });
  }
};

const saveSubject = async (req, res) => {
  try {
    const requestParams = { ...(req.query || {}), ...(req.params || {}), ...(req.body || {}) };
    // ensure school_id from authenticated user if available
    if (req.user) {
      const userSchoolId = req.user.school_id || req.user.SchoolId || req.user.schoolId || null;
      if (userSchoolId) requestParams.school_id = Number(userSchoolId);
    }

    logger && logger.debug && logger.debug("saveSubject requestParams:", requestParams);

    const subjectId = requestParams.subjectId || requestParams.id || null;

    if (!subjectId && (!requestParams.subject_name || !requestParams.subject_code)) {
      return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "subject_name and subject_code are required" });
    }

    let subject;
    if (subjectId) {
      subject = await SubjectService.updateSubject(subjectId, requestParams);
      if (!subject) return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to update subject" });
    } else {
      subject = await SubjectService.createSubject(requestParams);
      if (!subject) return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to create subject" });
    }

    return res.status(STATUS.OK).json({ status: "success", data: subject });
  } catch (err) {
    logger && logger.error && logger.error("saveSubject controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to save subject", error: err.message });
  }
};

const getSubjectDetails = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "subject id is required" });

    const subject = await SubjectService.getSubjectDetails(id);
    if (!subject) return res.status(STATUS.NOT_FOUND).json({ status: "error", message: "Subject not found" });

    return res.status(STATUS.OK).json({ status: "success", data: subject });
  } catch (err) {
    logger && logger.error && logger.error("getSubjectDetails controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch subject", error: err.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};
    if (!id) return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "subject id is required" });

    const updated = await SubjectService.updateSubject(id, payload);
    if (!updated) return res.status(STATUS.NOT_FOUND).json({ status: "error", message: "Subject not found or nothing to update" });

    return res.status(STATUS.OK).json({ status: "success", data: updated });
  } catch (err) {
    logger && logger.error && logger.error("updateSubject controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Something went wrong while updating subject", error: err.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "subject id is required" });

    const deleted = await SubjectService.deleteSubject(id);
    if (!deleted) return res.status(STATUS.NOT_FOUND).json({ status: "error", message: "Subject not found or could not be deleted" });

    return res.status(STATUS.OK).json({ status: "success", message: "Subject deleted" });
  } catch (err) {
    logger && logger.error && logger.error("deleteSubject controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to delete subject", error: err.message });
  }
};

module.exports = {
  listSubjects,
  getAllSubjects,
  saveSubject,
  getSubjectDetails,
  updateSubject,
  deleteSubject,
};
