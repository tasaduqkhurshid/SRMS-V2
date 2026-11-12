"use strict";

const ModelUtils = require("../../utils/ModelUtils");
const RedisCacheService = require("../common/RedisCacheService");
const NotificationService = require("../common/NotificationService");
const logger = require("../../utils/logger");
const { Exam, Result, Student, CourseSubject } = require("../../db/models");
const { ValidationError, NotFoundError } = require("../../utils/applicationErrors");
const { success, failure } = require("../../utils/serviceResult");

const CACHE_KEYS = {
  EXAMS_LIST: "exams:list",
  EXAM: (id) => `exam:${id}`,
};

const listExams = async ({ page = 1, limit = 50, query = "" } = {}) => {
  try {
    const pg = Math.max(1, Number(page || 1));
    const lim = Math.max(1, Number(limit || 50));
    const skip = (pg - 1) * lim;

    const where = {};
    if (query && query.trim()) {
      const regex = new RegExp(query.trim(), "i");
      where.exam_name = regex;
    }

    const result = await ModelUtils.findAndCountAll(Exam, where, { limit: lim, skip, sort: { _id: -1 } });
    return success({ meta: { page: pg, limit: lim, total: result.count }, exams: result.rows });
  } catch (error) {
    return failure(error);
  }
};

const getAllExams = async () => {
  try {
    logger.debug("ExamService.getAllExams: Fetching all exams");
    const exams = await RedisCacheService.getOrSet(
      CACHE_KEYS.EXAMS_LIST,
      async () => {
        logger.debug("ExamService.getAllExams: Cache miss, querying database");
        const examsData = await ModelUtils.findAll(Exam, {}, { sort: { exam_name: 1 } });
        logger.info(`ExamService.getAllExams: Found ${examsData ? examsData.length : 0} exams`);
        return examsData || [];
      },
      3600
    );
    return success(exams);
  } catch (error) {
    logger.error("ExamService.getAllExams error:", error);
    return failure(error);
  }
};

const getExamById = async (id) => {
  try {
    if (!id) return success(null);
    const exam = await RedisCacheService.getOrSet(
      CACHE_KEYS.EXAM(id),
      async () => await ModelUtils.findOne(Exam, { _id: id }),
      3600
    );
    return success(exam);
  } catch (error) {
    return failure(error);
  }
};

const createExam = async (payload) => {
  try {
    if (!payload) return success(null);
    const created = await ModelUtils.createAndReturn(Exam, payload);

    if (created) {
      await RedisCacheService.del(CACHE_KEYS.EXAMS_LIST);

      // Send exam creation notification to school admins
      NotificationService.createSchoolAdminNotification({
        schoolId: created.school_id,
        title: `New Exam Created: ${created.exam_name}`,
        message: `A new exam "${created.exam_name}" has been scheduled.`,
        type: 'info',
        category: 'examination',
        actionUrl: `/exams/${created._id}`,
      }).catch(err => console.error("Failed to send exam creation notification:", err.message));
    }

    return success(created);
  } catch (error) {
    return failure(error);
  }
};

const updateExam = async (id, payload) => {
  try {
    if (!id) throw new ValidationError("examId is required");
    const existing = await ModelUtils.findOne(Exam, { _id: id });
    if (!existing) throw new NotFoundError("Exam");
    
    const updated = await ModelUtils.updateAndReturn(Exam, { _id: id }, payload);
    if (updated && updated.rows && updated.rows.length) {
      await RedisCacheService.del(CACHE_KEYS.EXAM(id));
      await RedisCacheService.del(CACHE_KEYS.EXAMS_LIST);
      
      // Send exam schedule change notification to school admins
      const changes = Object.keys(payload).filter(k => k !== 'school_id').join(', ');
      NotificationService.createSchoolAdminNotification({
        schoolId: existing.school_id,
        title: `Exam Schedule Updated: ${existing.exam_name}`,
        message: `The exam "${existing.exam_name}" has been updated. Changes: ${changes}`,
        type: 'warning',
        category: 'examination',
        actionUrl: `/exams/${id}`,
      }).catch(err => console.error("Failed to send exam update notification:", err.message));

      return success(updated.rows[0]);
    }
    throw new NotFoundError("Exam");
  } catch (error) {
    return failure(error);
  }
};

const deleteExam = async (id) => {
  try {
    if (!id) throw new ValidationError("examId is required");
    await ModelUtils.remove(Exam, { _id: id });

    await RedisCacheService.del(CACHE_KEYS.EXAM(id));
    await RedisCacheService.del(CACHE_KEYS.EXAMS_LIST);

    return success(true);
  } catch (error) {
    return failure(error);
  }
};

const duplicateSession = async (fromAcademicYearId, toAcademicYearId, schoolId) => {
  try {
    if (!fromAcademicYearId || !toAcademicYearId) return success([]);
    const exams = await ModelUtils.findAll(Exam, { academic_year_id: fromAcademicYearId, school_id: schoolId });
    const created = [];
    for (const e of exams) {
      const payload = { exam_name: e.exam_name, max_marks: e.max_marks, school_id: e.school_id, academic_year_id: toAcademicYearId };
      const res = await ModelUtils.createAndReturn(Exam, payload);
      if (res) created.push(res);
    }
    return success(created);
  } catch (error) {
    return failure(error);
  }
};

const initializeResults = async (examId, courseId) => {
  try {
    if (!examId || !courseId) throw new ValidationError("examId and courseId are required");
    const { Student, CourseSubject, Result } = require("../../db/models");

    const students = await ModelUtils.findAll(Student, { class: courseId });
    if (!students || !students.length) return success(0);

    const courseSubjects = await ModelUtils.findAll(CourseSubject, { course_id: courseId });
    const subjectIds = (courseSubjects || []).map((s) => s.subject_id).filter(Boolean);
    if (!subjectIds.length) return success(0);

    let createdCount = 0;
    const examRec = await ModelUtils.findOne(Exam, { _id: examId });
    const examAcademicYear = examRec && examRec.academic_year_id ? examRec.academic_year_id : null;

    for (const st of students) {
      for (const sid of subjectIds) {
        const existing = await ModelUtils.findOne(Result, { student_id: st._id, subject_id: sid, exam_id: examId });
        if (!existing) {
          await ModelUtils.createAndReturn(Result, { student_id: st._id, subject_id: sid, exam_id: examId, school_id: st.school_id, academic_year_id: examAcademicYear });
          createdCount++;
        }
      }
    }
    return success(createdCount);
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  listExams,
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  duplicateSession,
  initializeResults,
};