"use strict";

const { Student } = require("../../db/models");
const { User } = require("../../db/models");
const bcrypt = require("bcryptjs");
const AuthService = require("../../services/AuthService");
const StudentPortalService = require("../StudentPortalService");
const { brandingAssetUrl } = require("../../utils/brandingUrls");
const { success, failure } = require("../../utils/serviceResult");

const matchesDateOfBirth = (input, value) => {
  if (!value) return false;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const normalizedInput = String(input).trim();

  return [
    `${day}-${month}-${year}`,
    `${day}/${month}/${year}`,
    `${year}-${month}-${day}`,
    `${year}/${month}/${day}`,
  ].includes(normalizedInput);
};

const getSchoolBrand = async (school) => {
  try {
    if (!school) return success(null);

    return success({
      schoolCode: school.school_code,
      name: school.name || school.school_name,
      abbreviation: school.abbreviation || school.school_code,
      address: school.address || "",
      phone: school.phone || school.contact_number || "",
      email: school.email || "",
      website: school.website || "",
      logoUrl: brandingAssetUrl(school, "logo") || school.logo_url || school.logo_path || "",
      campusImageUrl: brandingAssetUrl(school, "welcome-image") || school.campus_image_url || "",
      tagline: school.branding?.tagline || "A place to learn, grow, and succeed.",
      description: school.branding?.description || "A welcoming place to support learning, academic progress, and student success.",
    });
  } catch (error) {
    return failure(error);
  }
};

const login = async ({ studentId, password, school }) => {
  try {
    const normalizedStudentId = typeof studentId === "string" ? studentId.trim() : "";
    if (!normalizedStudentId || !password || !school?._id || school.status === "inactive") return success(null);

    const studentMatches = await Student.find({
      school_id: school._id,
      $or: [
        { student_code: normalizedStudentId },
        { admission_number: normalizedStudentId },
        { roll_number: normalizedStudentId },
      ],
    }).select("+password_hash").limit(2).lean();

    if (studentMatches.length !== 1) return success(null);
    const [student] = studentMatches;

    const passwordMatches = student?.password_hash
      ? await bcrypt.compare(String(password), student.password_hash)
      : false;
    const dateOfBirthMatches = matchesDateOfBirth(password, student?.dob);
    if (!passwordMatches && !dateOfBirthMatches) return success(null);

    const identity = {
      id: student._id.toString(),
      student_id: student._id,
      role: "student",
      school_id: student.school_id,
    };
    const profileResult = await StudentPortalService.getStudentProfile(identity);
    if (profileResult.error) return failure(profileResult.error);
    if (!profileResult.data?.student) return success(null);

    return success({
      token: AuthService.signJwt({
        id: student._id,
        student_id: student._id,
        role: "student",
        school_id: student.school_id,
        token_type: "student",
      }),
      user: {
        id: student._id.toString(),
        role: "student",
        studentId: student._id.toString(),
        school_id: student.school_id,
      },
      school: profileResult.data.school,
      student: profileResult.data.student,
    });
  } catch (error) {
    return failure(error);
  }
};

const loginParent = async ({ username, password, school }) => {
  try {
    const identifier = String(username || "").trim();
    if (!identifier || !password || !school?._id || school.status === "inactive") return success(null);
    const parent = await User.findOne({
      school_id: school._id,
      role: "PARENT",
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
    }).lean();
    if (!parent || !(await bcrypt.compare(String(password), parent.password || ""))) return success(null);
    const linkedIds = (parent.linked_student_ids || []).map(String);
    if (!linkedIds.length) return success(null);
    const linkedStudents = await Student.find({ school_id: school._id, _id: { $in: linkedIds } }).lean();
    if (linkedStudents.length !== linkedIds.length) return success(null);
    const profiles = await Promise.all(linkedStudents.map(async (student) => {
      const profile = await StudentPortalService.getStudentProfile({ student_id: student._id, school_id: school._id });
      return profile.error ? null : profile.data?.student || null;
    }));
    if (profiles.some((profile) => !profile)) return success(null);
    const schoolProfile = await StudentPortalService.getStudentProfile({ student_id: linkedStudents[0]._id, school_id: school._id });
    return success({
      token: AuthService.signJwt({ id: parent._id, role: "PARENT", school_id: school._id, token_type: "parent" }),
      user: { id: String(parent._id), username: parent.username, email: parent.email || "", role: "parent", school_id: String(school._id) },
      school: schoolProfile.data?.school || null,
      children: profiles,
    });
  } catch (error) { return failure(error); }
};

const me = async (user) => {
  return await StudentPortalService.getStudentProfile(user);
};

module.exports = { getSchoolBrand, login, loginParent, me };
