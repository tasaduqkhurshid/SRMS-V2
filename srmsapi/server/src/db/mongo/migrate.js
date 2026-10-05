"use strict";

const db = require("../models");

const createIndexes = async () => {
  const schools = await db.School.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] }).lean();
  for (const school of schools) {
    const source = school.school_code || school.school_name || school.name || '';
    const slug = source.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) throw new Error(`Cannot generate school slug for ${school._id}; set it manually before migrating`);
    await db.School.collection.updateOne({ _id: school._id }, { $set: { slug, status: school.status || 'active' } });
  }

  const legacyResults = await db.Result.collection.find({ school_id: { $exists: false } }).toArray();
  for (const result of legacyResults) {
    const student = await db.Student.findById(result.student_id).select('school_id').lean();
    if (student?.school_id) await db.Result.collection.updateOne({ _id: result._id }, { $set: { school_id: student.school_id } });
  }

  const legacyCourseSubjects = await db.CourseSubject.collection.find({ school_id: { $exists: false } }).toArray();
  for (const row of legacyCourseSubjects) {
    const course = await db.Course.findById(row.course_id).select('school_id').lean();
    const subject = await db.Subject.findById(row.subject_id).select('school_id').lean();
    if (course?.school_id && String(course.school_id) === String(subject?.school_id)) {
      await db.CourseSubject.collection.updateOne({ _id: row._id }, { $set: { school_id: course.school_id } });
    }
  }

  const legacyStudentSubjects = await db.StudentSubject.collection.find({ school_id: { $exists: false } }).toArray();
  for (const row of legacyStudentSubjects) {
    const student = await db.Student.findById(row.student_id).select('school_id').lean();
    const subject = await db.Subject.findById(row.subject_id).select('school_id').lean();
    if (student?.school_id && String(student.school_id) === String(subject?.school_id)) {
      await db.StudentSubject.collection.updateOne({ _id: row._id }, { $set: { school_id: student.school_id } });
    }
  }

  await db.School.collection.createIndex({ school_code: 1 }, { unique: true, sparse: true });
  await db.School.collection.createIndex({ slug: 1 }, { unique: true, sparse: true });
  await db.User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
  await db.User.collection.createIndex({ email: 1 }, { sparse: true });
  await db.User.collection.createIndex({ school_id: 1, username: 1 }, { unique: true, sparse: true });

  await db.AcademicYear.collection.createIndex({ school_id: 1, name: 1 }, { unique: true });
  await db.Course.collection.createIndex({ school_id: 1, course_code: 1 }, { unique: true, sparse: true });
  await db.Subject.collection.createIndex({ school_id: 1, subject_code: 1 }, { unique: true, sparse: true });
  await db.Subject.collection.createIndex({ school_id: 1, subject_name: 1 }, { unique: true });
  await db.Exam.collection.createIndex({ school_id: 1, exam_name: 1 }, { unique: true });

  await db.Student.collection.createIndex({ school_id: 1, roll_number: 1 }, { unique: true });
  await db.Student.collection.createIndex({ school_id: 1, student_code: 1 }, { unique: true, sparse: true });
  await db.Student.collection.createIndex({ school_id: 1, class: 1, section: 1 });
  await db.StudentSubject.collection.createIndex(
    { student_id: 1, subject_id: 1, academic_year_id: 1 },
    { unique: true, sparse: true }
  );
  await db.CourseSubject.collection.createIndex({ course_id: 1, subject_id: 1 }, { unique: true });
  await db.MarksheetTemplate.collection.createIndex({ school_id: 1, name: 1 }, { unique: true });
  await db.Result.collection.createIndex({ school_id: 1, student_id: 1, subject_id: 1, exam_id: 1, academic_year_id: 1 }, { unique: true, name: 'unique_school_student_subject_exam_year' });
};

const run = async () => {
  try {
    await db.connectDB();
    await createIndexes();
    console.log("Mongo migrations completed");
  } catch (error) {
    console.error("Mongo migrations failed:", error);
    process.exitCode = 1;
  } finally {
    await db.mongoose.connection.close();
  }
};

run();
