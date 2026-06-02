const ModelUtils = require('../utils/ModelUtils');
const RedisCacheService = require('./RedisCacheService');
const logger = require('../utils/logger');
const { Exam, Result, Student, CourseSubject } = require('../db/models');

const CACHE_KEYS = {
  EXAMS_LIST: "exams:list",
  EXAM: (id) => `exam:${id}`
};

const listExams = async ({ page = 1, limit = 50, query = '' } = {}) => {
  const pg = Math.max(1, Number(page || 1));
  const lim = Math.max(1, Number(limit || 50));
  const skip = (pg - 1) * lim;

  const where = {};
  if (query && query.trim()) {
    const regex = new RegExp(query.trim(), 'i');
    where.exam_name = regex;
  }

  const result = await ModelUtils.findAndCountAll(Exam, where, { limit: lim, skip, sort: { _id: -1 } });
  return { meta: { page: pg, limit: lim, total: result.count }, exams: result.rows };
};

/**
 * Get all exams for select dropdowns (cached)
 */
const getAllExams = async () => {
  logger.debug('ExamService.getAllExams: Fetching all exams');
  try {
    return await RedisCacheService.getOrSet(
      CACHE_KEYS.EXAMS_LIST,
      async () => {
        logger.debug('ExamService.getAllExams: Cache miss, querying database');
        const exams = await ModelUtils.findAll(Exam, {}, { sort: { exam_name: 1 } });
        logger.info(`ExamService.getAllExams: Found ${exams ? exams.length : 0} exams`);
        return exams || [];
      },
      3600 // Cache for 1 hour
    );
  } catch (error) {
    logger.error('ExamService.getAllExams error:', error);
    throw error;
  }
};

const getExam = async (id) => { 
  if (!id) return null;
  return await RedisCacheService.getOrSet(
    CACHE_KEYS.EXAM(id),
    async () => await ModelUtils.findOne(Exam, { _id: id }),
    3600
  );
};

const createExam = async (payload) => { 
  if (!payload) return null;
  const created = await ModelUtils.createAndReturn(Exam, payload);
  
  // Invalidate cache
  if (created) {
    await RedisCacheService.del(CACHE_KEYS.EXAMS_LIST);
  }
  
  return created;
};

const updateExam = async (id, payload) => { 
  if (!id) return null;
  const updated = await ModelUtils.updateAndReturn(Exam, { _id: id }, payload);
  if (updated && updated.rows && updated.rows.length) {
    // Invalidate cache
    await RedisCacheService.del(CACHE_KEYS.EXAM(id));
    await RedisCacheService.del(CACHE_KEYS.EXAMS_LIST);
    return updated.rows[0];
  }
  return await getExam(id);
};

const deleteExam = async (id) => { 
  if (!id) return false;
  await ModelUtils.remove(Exam, { _id: id });
  
  // Invalidate cache
  await RedisCacheService.del(CACHE_KEYS.EXAM(id));
  await RedisCacheService.del(CACHE_KEYS.EXAMS_LIST);
  
  return true;
};

/**
 * Duplicate all exams from one academic year to another for the same school.
 * Returns array of created exam rows.
 */
const duplicateSession = async (fromAcademicYearId, toAcademicYearId, schoolId) => {
  if (!fromAcademicYearId || !toAcademicYearId) return [];
  const exams = await ModelUtils.findAll(Exam, { academic_year_id: fromAcademicYearId, school_id: schoolId });
  const created = [];
  for (const e of exams) {
    const payload = { exam_name: e.exam_name, max_marks: e.max_marks, school_id: e.school_id, academic_year_id: toAcademicYearId };
    const res = await ModelUtils.createAndReturn(Exam, payload);
    if (res) created.push(res);
  }
  return created;
};

/**
 * Initialize empty result placeholders for a given exam and course.
 * This will create Result rows for each student in the course for each subject assigned to the course.
 * Idempotent: skips existing results for same student/subject/exam.
 */
const initializeResults = async (examId, courseId) => {
  if (!examId || !courseId) return 0;
  const { Student, CourseSubject, Result } = require('../db/models');

  // students in course
  const students = await ModelUtils.findAll(Student, { class: courseId });
  if (!students || !students.length) return 0;

  // subjects for course
  const courseSubjects = await ModelUtils.findAll(CourseSubject, { course_id: courseId });
  const subjectIds = (courseSubjects || []).map(s => s.subject_id).filter(Boolean);
  if (!subjectIds.length) return 0;

  let createdCount = 0;
  // determine exam's academic_year if available
  const examRec = await ModelUtils.findOne(Exam, { _id: examId });
  const examAcademicYear = examRec && examRec.academic_year_id ? examRec.academic_year_id : null;

  for (const st of students) {
    for (const sid of subjectIds) {
      // check existing
      const existing = await ModelUtils.findOne(Result, { student_id: st._id, subject_id: sid, exam_id: examId });
      if (!existing) {
        await ModelUtils.createAndReturn(Result, { student_id: st._id, subject_id: sid, exam_id: examId, school_id: st.school_id, academic_year_id: examAcademicYear });
        createdCount++;
      }
    }
  }
  return createdCount;
};

module.exports = { listExams, getAllExams, getExam, createExam, updateExam, deleteExam, duplicateSession, initializeResults };
