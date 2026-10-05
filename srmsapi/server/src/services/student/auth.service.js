const { Student } = require('../../db/models');
const bcrypt = require('bcryptjs');
const AuthService = require('../../services/AuthService');
const StudentPortalService = require('../StudentPortalService');

const getSchoolBrand = async (school) => {
  if (!school) return null;

  return {
    schoolCode: school.school_code,
    name: school.name || school.school_name,
    abbreviation: school.abbreviation || school.school_code,
    address: school.address || '',
    phone: school.phone || school.contact_number || '',
    email: school.email || '',
    website: school.website || '',
    logoUrl: school.logo_url || school.logo_path || '',
    campusImageUrl: school.campus_image_url || '',
  };
};

const login = async ({ studentId, password, school }) => {
  const normalizedStudentId = typeof studentId === 'string' ? studentId.trim() : '';
  if (!normalizedStudentId || !password || !school?._id || school.status === 'inactive') return null;

  const studentMatches = await Student.find({
    school_id: school._id,
    $or: [
      { student_code: normalizedStudentId },
      { admission_number: normalizedStudentId },
      { roll_number: normalizedStudentId },
    ],
  }).select('+password_hash').limit(2).lean();
  if (studentMatches.length !== 1) return null;
  const [student] = studentMatches;
  if (!student?.password_hash) return null;

  const passwordMatches = await bcrypt.compare(password, student.password_hash);
  if (!passwordMatches) return null;

  const identity = {
    id: student._id.toString(),
    student_id: student._id,
    role: 'student',
    school_id: student.school_id,
  };
  const profile = await StudentPortalService.getStudentProfile(identity);
  if (!profile?.student) return null;

  return {
    token: AuthService.signJwt({
      id: student._id,
      student_id: student._id,
      role: 'student',
      school_id: student.school_id,
      token_type: 'student',
    }),
    user: {
      id: student._id.toString(),
      role: 'student',
      studentId: student._id.toString(),
      school_id: student.school_id,
    },
    school: profile.school,
    student: profile.student,
  };
};

const me = async (user) => StudentPortalService.getStudentProfile(user);

module.exports = { getSchoolBrand, login, me };
