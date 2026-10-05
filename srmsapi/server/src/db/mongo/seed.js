"use strict";

const db = require("../models");
const bcrypt = require("bcryptjs");
const { seedNewSchool } = require("./seeders/school.seeder");

const SCHOOL_CODE = "HIT";
const ADMIN_PASSWORD = "password";
const ADMIN_PIN = "1234";

const courses = [
  ["Pre Nursery", "pre_nursery", "Pre Nursery"],
  ["Nursery", "nursery", "Nursery"],
  ["L.K.G", "lkg_pry", "Lower Kindergarten"],
  ["U.K.G", "ukg_pry", "Upper Kindergarten"],
  ["1st", "1st_pry", "1st Pry"],
  ["2nd", "2nd_pry", "2nd Pry"],
  ["3rd", "3rd_pry", "3rd Pry"],
  ["4th", "4th_pry", "4th Pry"],
  ["5th", "5th_grade", "5th Grade"],
  ["6th", "6th_grade", "6th Grade"],
  ["7th", "7th_grade", "7th Grade"],
  ["8th", "8th_grade", "8th Grade"],
  ["9th", "9th_grade", "9th Grade"],
  ["10th", "10th_grade", "10th Grade"]
];

const subjects = [
  ["English", "english"],
  ["Urdu", "urdu"],
  ["Math", "math"],
  ["Evs", "evs"],
  ["E.Rhyme", "e_rhy"],
  ["I.Rhyme", "i_rhy"],
  ["Story", "story"],
  ["Drawing", "drawing"],
  ["Al Quran", "al_quran"]
];

const exams = [
  ["F1", 20],
  ["F2", 20],
  ["F3", 20],
  ["F4", 20],
  ["F5", 20],
  ["F6", 20],
  ["SA", 80]
];

const templates = [
  ["Professional Classic", "<h1>{{school_name}}</h1><h2>Marksheet</h2><p>{{student_name}}</p><div>{{marks}}</div>"],
  ["Modern Blue", "<h1>{{school_name}}</h1><section>{{student_name}}</section><section>{{marks}}</section>"],
  ["Gradient Premium", "<h1>{{school_name}}</h1><p>{{class}} - {{section}}</p><div>{{marks}}</div>"]
];

const upsertBy = async (Model, filter, update) => {
  return Model.findOneAndUpdate(
    filter,
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const seedDemo = async () => {
    const school = await upsertBy(
      db.School,
      { school_code: SCHOOL_CODE },
      {
        school_name: "Hubi -InfoTech",
        name: "Hubi -InfoTech",
        school_code: SCHOOL_CODE,
        email: "info@hubiinfotech.com",
        address: "Dialgam, Anantnag",
        contact_number: "7006703035",
        phone: "7006703035"
      }
    );

    const hanfiaSchool = await upsertBy(db.School, { slug: 'hanfia' }, {
      school_name: 'Hanfia Noor Ul Aiza Islamia High School',
      name: 'Hanfia Noor Ul Aiza Islamia High School',
      school_code: 'HANFIA',
      slug: 'hanfia',
      status: 'active',
    });
    const schoolB = await upsertBy(db.School, { slug: 'schoolb' }, {
      school_name: 'SRMS School B Test Campus',
      name: 'SRMS School B Test Campus',
      school_code: 'SCHOOLB',
      slug: 'schoolb',
      status: 'active',
    });
    await seedNewSchool({ schoolId: hanfiaSchool._id, slug: hanfiaSchool.slug, name: hanfiaSchool.school_name });
    await seedNewSchool({ schoolId: schoolB._id, slug: schoolB.slug, name: schoolB.school_name });

    await upsertBy(db.User, { username: 'hanfia-admin' }, {
      username: 'hanfia-admin',
      email: 'admin@hanfia.srms.local',
      password: bcrypt.hashSync(process.env.HANFIA_ADMIN_PASSWORD || 'hanfia-admin-local-only', 10),
      role: 'ADMIN',
      school_id: hanfiaSchool._id,
    });
    await upsertBy(db.User, { username: 'schoolb-admin' }, {
      username: 'schoolb-admin',
      email: 'admin@schoolb.srms.local',
      password: bcrypt.hashSync(process.env.SCHOOLB_ADMIN_PASSWORD || 'schoolb-admin-local-only', 10),
      role: 'ADMIN',
      school_id: schoolB._id,
    });

    const demoStudentPassword = process.env.DEMO_STUDENT_PASSWORD || 'student-local-only';
    await upsertBy(db.Student, { school_id: hanfiaSchool._id, student_code: 'STU001' }, {
      school_id: hanfiaSchool._id,
      student_code: 'STU001',
      admission_number: 'STU001',
      roll_number: '1',
      name: 'Hanfia Demo Student',
      dob: new Date('2012-05-14T00:00:00.000Z'),
      class: '1st',
      section: 'A',
      password_hash: bcrypt.hashSync(demoStudentPassword, 10),
    });
    await upsertBy(db.Student, { school_id: schoolB._id, student_code: 'STU001' }, {
      school_id: schoolB._id,
      student_code: 'STU001',
      admission_number: 'STU001',
      roll_number: '1',
      name: 'School B Demo Student',
      dob: new Date('2011-09-22T00:00:00.000Z'),
      class: '1st',
      section: 'A',
      password_hash: bcrypt.hashSync(process.env.SCHOOLB_STUDENT_PASSWORD || 'schoolb-student-local-only', 10),
    });

    await upsertBy(
      db.User,
      { username: "admin" },
      {
        username: "admin",
        email: "admin@hubiinfotech.com",
        password: bcrypt.hashSync(ADMIN_PASSWORD, 10),
        pin: bcrypt.hashSync(ADMIN_PIN, 10),
        role: "ADMIN",
        school_id: school._id
      }
    );

    const currentYear = new Date().getFullYear();
    const academicYear = await upsertBy(
      db.AcademicYear,
      { school_id: school._id, name: `${currentYear}-${currentYear + 1}` },
      {
        name: `${currentYear}-${currentYear + 1}`,
        start_date: new Date(`${currentYear}-04-01T00:00:00.000Z`),
        end_date: new Date(`${currentYear + 1}-03-31T00:00:00.000Z`),
        school_id: school._id
      }
    );

    for (const [course_name, course_code, description] of courses) {
      await upsertBy(db.Course, { school_id: school._id, course_code }, { course_name, course_code, description, school_id: school._id });
    }

    for (const [subject_name, subject_code] of subjects) {
      await upsertBy(db.Subject, { school_id: school._id, subject_code }, {
        subject_name,
        subject_code,
        has_theory: true,
        has_lab: false,
        has_attendance: false,
        has_activity: false,
        school_id: school._id
      });
    }

    for (const [exam_name, max_marks] of exams) {
      await upsertBy(db.Exam, { school_id: school._id, exam_name }, {
        exam_name,
        max_marks,
        school_id: school._id,
        academic_year_id: academicYear._id
      });
    }

    for (const [name, html_content] of templates) {
      await upsertBy(db.MarksheetTemplate, { school_id: school._id, name }, {
        name,
        html_content,
        is_active: true,
        school_id: school._id
      });
    }

    console.log("Mongo demo seed completed");
    console.log(`Admin login: admin / ${ADMIN_PASSWORD}`);
    console.log(`Admin PIN login: admin@hubiinfotech.com / ${ADMIN_PIN}`);
    console.log(`Hanfia school admin: hanfia-admin / ${process.env.HANFIA_ADMIN_PASSWORD || 'hanfia-admin-local-only'}`);
    console.log(`Hanfia demo student: STU001 / ${demoStudentPassword}`);
    console.log(`School B test tenant: schoolb / ${process.env.SCHOOLB_ADMIN_PASSWORD || 'schoolb-admin-local-only'}`);
};

module.exports = { seedDemo };
