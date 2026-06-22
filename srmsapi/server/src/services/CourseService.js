const ModelUtils = require("../utils/ModelUtils");
const RedisCacheService = require("./RedisCacheService");
const logger = require("../utils/logger");
const { Course, Subject, CourseSubject, Student, StudentSubject } = require("../db/models");

const CACHE_KEYS = {
  COURSES_LIST: "courses:list",
  COURSE: (id) => `course:${id}`,
  COURSE_SUBJECTS: (id) => `course:${id}:subjects`
};

const listCourses = async ({ page = 1, limit = 50, query = "" } = {}) => {
  const pg = Math.max(1, Number(page || 1));
  const lim = Math.max(1, Number(limit || 50));
  const skip = (pg - 1) * lim;

  // For paginated results, don't cache (only cache full list)
  const where = {};
  if (query && query.trim()) {
    const regex = new RegExp(query.trim(), 'i');
    where.$or = [
      { course_name: regex },
      { course_code: regex },
    ];
  }

  const result = await ModelUtils.findAndCountAll(Course, where, { limit: lim, skip, sort: { _id: -1 } });
  return { meta: { page: pg, limit: lim, total: result.count }, courses: result.rows };
};

/**
 * Get all courses for select dropdowns (cached)
 */
const getAllCourses = async () => {
  logger.debug('CourseService.getAllCourses: Fetching all courses');
  try {
    return await RedisCacheService.getOrSet(
      CACHE_KEYS.COURSES_LIST,
      async () => {
        logger.debug('CourseService.getAllCourses: Cache miss, querying database');
        const courses = await ModelUtils.findAll(Course, {}, { sort: { course_name: 1 } });
        logger.info(`CourseService.getAllCourses: Found ${courses ? courses.length : 0} courses`);
        return courses || [];
      },
      3600 // Cache for 1 hour
    );
  } catch (error) {
    logger.error('CourseService.getAllCourses error:', error);
    throw error;
  }
};

const getCourse = async (id) => {
  if (!id) return null;
  
  return await RedisCacheService.getOrSet(
    CACHE_KEYS.COURSE(id),
    async () => {
      return await ModelUtils.findOne(Course, { _id: id });
    },
    3600
  );
};

const createCourse = async (payload) => {
  if (!payload) return null;
  const created = await ModelUtils.createAndReturn(Course, payload);
  
  // Invalidate cache
  if (created) {
    await RedisCacheService.del(CACHE_KEYS.COURSES_LIST);
  }
  
  return created;
};

const updateCourse = async (id, payload) => {
  if (!id) return null;
  const updated = await ModelUtils.updateAndReturn(Course, { _id: id }, payload);
  if (updated && updated.rows && updated.rows.length) {
    // Invalidate cache
    await RedisCacheService.del(CACHE_KEYS.COURSE(id));
    await RedisCacheService.del(CACHE_KEYS.COURSES_LIST);
    return updated.rows[0];
  }
  return await getCourse(id);
};

const deleteCourse = async (id) => {
  if (!id) return false;
  await ModelUtils.remove(Course, { _id: id });
  
  // Invalidate cache
  await RedisCacheService.del(CACHE_KEYS.COURSE(id));
  await RedisCacheService.del(CACHE_KEYS.COURSES_LIST);
  
  return true;
};

/**
 * Get subjects for a course (cached)
 */
const getCourseSubjects = async (courseId) => {
  if (!courseId) return [];
  
  return await RedisCacheService.getOrSet(
    CACHE_KEYS.COURSE_SUBJECTS(courseId),
    async () => {
      const rows = await ModelUtils.findAll(CourseSubject, { course_id: courseId }, { populate: 'subject', sort: { 'subject.subject_name': 1 } });
      return rows || [];
    },
    3600
  );
};

/**
 * Set subjects for a course (replace existing)
 */
const setCourseSubjects = async (courseId, subjectIds = [], schoolId = null) => {
  if (!courseId) throw new Error("courseId is required");
  const ids = Array.isArray(subjectIds) ? subjectIds.map(v => Number(v)).filter(Boolean) : [];

  // read existing subject ids for this course to determine added / removed
  const existingRows = await ModelUtils.findAll(CourseSubject, { course_id: courseId });
  const existingIds = (existingRows || []).map(r => Number(r.subject_id)).filter(Boolean);

  const toAdd = ids.filter(id => !existingIds.includes(id));
  const toRemove = existingIds.filter(id => !ids.includes(id));

  // remove CourseSubject rows that are not in the new list
  const removeWhere = { course_id: courseId };
  if (ids.length) {
    removeWhere.subject_id = { $nin: ids };
  }
  await ModelUtils.remove(CourseSubject, removeWhere);

  const saved = [];
  for (const sid of ids) {
    const existing = await ModelUtils.findOne(CourseSubject, { course_id: courseId, subject_id: sid });
    if (!existing) {
      const created = await ModelUtils.createAndReturn(CourseSubject, { course_id: courseId, subject_id: sid, school_id: schoolId || null });
      saved.push(created);
    }
  }

  // Invalidate course subjects cache
  await RedisCacheService.del(CACHE_KEYS.COURSE_SUBJECTS(courseId));

  // Propagate additions/removals to students who belong to this course (student.class == courseId)
  try {
    // find students in this course
    const students = await ModelUtils.findAll(Student, { class: courseId });
    const studentIds = (students || []).map(s => s.id).filter(Boolean);

    // For added subject ids: upsert StudentSubject for every student
    if (toAdd.length && studentIds.length) {
      // reuse StudentService.setStudentSubjects which only inserts missing ones
      const StudentService = require("../services/StudentService");
      for (const sid of studentIds) {
        try {
          await StudentService.setStudentSubjects(sid, toAdd, schoolId || null);
        } catch (e) {
          // continue on errors for individual students
        }
      }
    }

    // For removed subject ids: remove StudentSubject rows for students in this course
    if (toRemove.length && studentIds.length) {
      await ModelUtils.remove(StudentSubject, {
        student_id: { $in: studentIds },
        subject_id: { $in: toRemove },
      });
    }
  } catch (propErr) {
    // don't fail the request — log and continue
    console.error('CourseService.setCourseSubjects propagation error:', propErr);
  }

  return await getCourseSubjects(courseId);
};

module.exports = {
  listCourses,
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseSubjects,
  setCourseSubjects,
};
