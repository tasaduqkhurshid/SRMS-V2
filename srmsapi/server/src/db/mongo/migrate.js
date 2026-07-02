"use strict";

const db = require("../models");

const createIndexes = async () => {
  await db.School.collection.createIndex({ school_code: 1 }, { unique: true, sparse: true });
  await db.User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
  await db.User.collection.createIndex({ email: 1 }, { sparse: true });
  await db.User.collection.createIndex({ school_id: 1, username: 1 }, { unique: true, sparse: true });

  await db.AcademicYear.collection.createIndex({ school_id: 1, name: 1 }, { unique: true });
  await db.Course.collection.createIndex({ school_id: 1, course_code: 1 }, { unique: true, sparse: true });
  await db.Subject.collection.createIndex({ school_id: 1, subject_code: 1 }, { unique: true, sparse: true });
  await db.Subject.collection.createIndex({ school_id: 1, subject_name: 1 }, { unique: true });
  await db.Exam.collection.createIndex({ school_id: 1, exam_name: 1 }, { unique: true });

  await db.Student.collection.createIndex({ school_id: 1, roll_number: 1 }, { unique: true });
  await db.Student.collection.createIndex({ school_id: 1, class: 1, section: 1 });
  await db.StudentSubject.collection.createIndex(
    { student_id: 1, subject_id: 1, academic_year_id: 1 },
    { unique: true, sparse: true }
  );
  await db.CourseSubject.collection.createIndex({ course_id: 1, subject_id: 1 }, { unique: true });
  await db.MarksheetTemplate.collection.createIndex({ school_id: 1, name: 1 }, { unique: true });
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
