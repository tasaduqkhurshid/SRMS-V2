"use strict";

const bcrypt = require('bcryptjs');
const { School, AcademicYear, User, Course, Subject, Exam } = require('../../models');

const DEFAULT_TAGLINE = 'A place to learn, grow, and succeed.';
const DEFAULT_DESCRIPTION = 'A welcoming place to support learning, academic progress, and student success.';

const DEFAULT_COURSES = [
  ['Pre Nursery', 'pre_nursery', 'Pre Nursery'],
  ['Nursery', 'nursery', 'Nursery'],
  ['L.K.G', 'lkg_pry', 'Lower Kindergarten'],
  ['U.K.G', 'ukg_pry', 'Upper Kindergarten'],
  ['1st', '1st_pry', '1st Pry'],
  ['2nd', '2nd_pry', '2nd Pry'],
  ['3rd', '3rd_pry', '3rd Pry'],
  ['4th', '4th_pry', '4th Pry'],
  ['5th', '5th_grade', '5th Grade'],
  ['6th', '6th_grade', '6th Grade'],
  ['7th', '7th_grade', '7th Grade'],
  ['8th', '8th_grade', '8th Grade'],
  ['9th', '9th_grade', '9th Grade'],
  ['10th', '10th_grade', '10th Grade'],
];

const DEFAULT_SUBJECTS = [
  ['English', 'english'], ['Urdu', 'urdu'], ['Math', 'math'], ['Evs', 'evs'],
  ['E.Rhyme', 'e_rhy'], ['I.Rhyme', 'i_rhy'], ['Story', 'story'],
  ['Drawing', 'drawing'], ['Al Quran', 'al_quran'],
];

const DEFAULT_EXAMS = [
  ['F1', 20], ['F2', 20], ['F3', 20], ['F4', 20], ['F5', 20], ['F6', 20], ['SA', 80],
];

async function seedNewSchool({ schoolId, slug, name, admin } = {}) {
  if (!schoolId || !slug || !name) throw new Error('schoolId, slug, and name are required to provision a school');

  const school = await School.findById(schoolId).lean();
  if (!school || school.slug !== slug) throw new Error('School identity does not match the requested provisioning tenant');

  const branding = school.branding || {};
  const defaults = {};
  if (branding.logoKey === undefined) defaults['branding.logoKey'] = '';
  if (branding.welcomeImageKey === undefined) defaults['branding.welcomeImageKey'] = '';
  if (branding.tagline === undefined) defaults['branding.tagline'] = DEFAULT_TAGLINE;
  if (branding.description === undefined) defaults['branding.description'] = DEFAULT_DESCRIPTION;
  if (!school.settings?.timezone) defaults['settings.timezone'] = process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata';
  if (school.settings?.notificationsEnabled === undefined) defaults['settings.notificationsEnabled'] = true;
  if (Object.keys(defaults).length) await School.updateOne({ _id: schoolId }, { $set: defaults });

  const year = new Date().getUTCFullYear();
  const academicYearName = `${year}-${year + 1}`;
  const academicYear = await AcademicYear.findOneAndUpdate(
    { school_id: schoolId, name: academicYearName },
    {
      $setOnInsert: {
        school_id: schoolId,
        name: academicYearName,
        start_date: new Date(Date.UTC(year, 3, 1)),
        end_date: new Date(Date.UTC(year + 1, 2, 31)),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // Provision the legacy SMS class, subject, and exam catalog for this tenant.
  // $setOnInsert preserves any records a school has already customized.
  for (const [course_name, course_code, description] of DEFAULT_COURSES) {
    const existingCourse = await Course.findOne({
      school_id: schoolId,
      $or: [{ course_code }, { course_name }],
    }).select('_id').lean();
    if (existingCourse) continue;
    await Course.findOneAndUpdate(
      { school_id: schoolId, course_code },
      { $setOnInsert: { school_id: schoolId, course_name, course_code, description } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  for (const [subject_name, subject_code] of DEFAULT_SUBJECTS) {
    const existingSubject = await Subject.findOne({
      school_id: schoolId,
      $or: [{ subject_code }, { subject_name }],
    }).select('_id').lean();
    if (existingSubject) continue;
    await Subject.create({
      school_id: schoolId,
      subject_name,
      subject_code,
      has_theory: true,
      has_lab: false,
      has_attendance: false,
      has_activity: false,
    });
  }

  for (const [exam_name, max_marks] of DEFAULT_EXAMS) {
    await Exam.findOneAndUpdate(
      { school_id: schoolId, exam_name },
      { $setOnInsert: { school_id: schoolId, exam_name, max_marks, academic_year_id: academicYear._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  if (admin) {
    const username = String(admin.username || '').trim();
    const password = typeof admin.password === 'string' ? admin.password : '';
    if (!username || password.length < 8) throw new Error('Provisioned school administrators need a username and password of at least 8 characters');
    const existingUsername = await User.findOne({ username }).lean();
    if (existingUsername && String(existingUsername.school_id) !== String(schoolId)) {
      throw new Error('Administrator username already belongs to another school');
    }
    await User.findOneAndUpdate(
      { school_id: schoolId, username },
      {
        $setOnInsert: {
          school_id: schoolId,
          username,
          email: String(admin.email || '').trim(),
          password: bcrypt.hashSync(password, 12),
          ...(admin.pin ? { pin: bcrypt.hashSync(String(admin.pin), 12) } : {}),
          role: admin.role || 'SCHOOL_ADMIN',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  return School.findById(schoolId).lean();
}

async function seedExistingSchools(db) {
  const schools = await db.School.find({ slug: { $type: 'string', $ne: '' } }).select('_id slug school_name name').lean();
  for (const school of schools) {
    await seedNewSchool({
      schoolId: school._id,
      slug: school.slug,
      name: school.school_name || school.name,
    });
  }
  return schools.length;
}

module.exports = {
  seedNewSchool,
  seedExistingSchools,
  DEFAULT_TAGLINE,
  DEFAULT_DESCRIPTION,
  DEFAULT_COURSES,
  DEFAULT_SUBJECTS,
  DEFAULT_EXAMS,
};
