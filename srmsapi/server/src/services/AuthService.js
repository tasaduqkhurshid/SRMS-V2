// services/auth.service.js
const { User } = require("../db/models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ModelUtils = require("../utils/ModelUtils");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = "12h";

const signJwt = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const buildSchoolData = (school) => {
  if (!school) return null;

  return {
    _id: school._id,
    name: school.name || school.school_name,
    school_name: school.school_name,
    abbreviation: school.abbreviation,
    email: school.email,
    phone: school.phone || school.contact_number,
    address: school.address,
    city: school.city,
    state: school.state,
    pincode: school.pincode,
    logo_path: school.logo_path,
    logo_url: school.logo_url,
    website: school.website,
    principal_name: school.principal_name,
    principal_email: school.principal_email,
    year_established: school.year_established,
    board: school.board,
  };
};

const buildAuthResponse = (userRecord) => {
  const school = userRecord.school_id || null;
  const schoolId = school?._id || school || null;

  return {
    token: signJwt({ id: userRecord._id, role: userRecord.role, school_id: schoolId }),
    user: {
      id: userRecord._id,
      username: userRecord.username,
      email: userRecord.email,
      role: userRecord.role,
      school_id: schoolId,
    },
    school: buildSchoolData(school),
  };
};

const login = async (identifier, password, schoolId) => {
  // allow identifier to be either username or email
  if (!identifier || !password) return null;
  if (!schoolId) return null;

  // first try by username
  let userRecord = await ModelUtils.findOne(User,
    { username: identifier, school_id: schoolId },
    { populate: { path: 'school_id' } }
  );

  // if not found try by email
  if (!userRecord) {
    userRecord = await ModelUtils.findOne(User,
      { email: identifier, school_id: schoolId },
      { populate: { path: 'school_id' } }
    );
  }

  if (!userRecord) return null;

  const ok = await bcrypt.compare(password, userRecord.password);
  if (!ok || !["ADMIN", "SCHOOL_ADMIN"].includes(String(userRecord.role).toUpperCase())) return null;

  return buildAuthResponse(userRecord);
};

const loginSuperAdmin = async (identifier, password) => {
  if (!identifier || !password) return null;
  const userRecord = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
    role: 'SUPER_ADMIN',
    school_id: null,
  }).lean();
  if (!userRecord || !(await bcrypt.compare(password, userRecord.password || ''))) return null;
  return buildAuthResponse(userRecord);
};

const loginPin = async (identifier, pin, schoolId) => {
  if (!identifier || !pin || !schoolId) return null;
  const userRecord = await ModelUtils.findOne(User,
    { $or: [{ username: identifier }, { email: identifier }], school_id: schoolId },
    { populate: { path: 'school_id' } }
  );
  if (!userRecord) return null;

  const isValid = await bcrypt.compare(pin, userRecord.pin || "");
  if (!isValid) return null;

  return buildAuthResponse(userRecord);
};

// ✅ Verify token service (this is what we need)
const verifyToken = async (token) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userRecord = await ModelUtils.findOne(
      User,
      { _id: payload.id },
      { populate: { path: "school_id" } }
    );
    if (!userRecord) return null;
    return {
      id: userRecord._id,
      username: userRecord.username,
      email: userRecord.email,
      role: userRecord.role,
      school_id: userRecord.school_id?._id || userRecord.school_id || null,
    };
  } catch {
    return null;
  }
};

module.exports = { login, loginSuperAdmin, loginPin, signJwt, verifyToken };
