// services/auth.service.js
const { User, School } = require("../db/models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ModelUtils = require("../utils/ModelUtils");
const { logger } = ModelUtils;

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = "12h";

const signJwt = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const login = async (identifier, password) => {
  // allow identifier to be either username or email
  if (!identifier || !password) return null;

  // first try by username
  let userRecord = await ModelUtils.findOne(User, 
    { username: identifier },
    { populate: { path: 'school_id' } }
  );

  // if not found try by email
  if (!userRecord) {
    userRecord = await ModelUtils.findOne(User, 
      { email: identifier },
      { populate: { path: 'school_id' } }
    );
  }

  if (!userRecord) return null;

  const ok = await bcrypt.compare(password, userRecord.password);
  if (!ok) return null;

  const token = signJwt({ id: userRecord._id, role: userRecord.role, school_id: userRecord.school_id });
  
  // Prepare school data
  const schoolData = userRecord.school_id ? {
    id: userRecord.school_id._id,
    name: userRecord.school_id.name,
    abbreviation: userRecord.school_id.abbreviation,
    email: userRecord.school_id.email,
    phone: userRecord.school_id.phone,
    address: userRecord.school_id.address,
    city: userRecord.school_id.city,
    state: userRecord.school_id.state,
    pincode: userRecord.school_id.pincode,
    logo_path: userRecord.school_id.logo_path,
    logo_url: userRecord.school_id.logo_url,
    website: userRecord.school_id.website,
    principal_name: userRecord.school_id.principal_name,
    principal_email: userRecord.school_id.principal_email,
    year_established: userRecord.school_id.year_established,
    board: userRecord.school_id.board,
  } : null;

  return { 
    token, 
    user: { 
      id: userRecord._id, 
      username: userRecord.username,
      email: userRecord.email,
      role: userRecord.role, 
      school_id: userRecord.school_id._id 
    },
    school: schoolData
  };
};

const loginPin = async (email, pin) => {
  logger && logger.debug && logger.debug("email", email, "pin", pin);
  const userRecord = await ModelUtils.findOne(User, 
    { email },
    { populate: { path: 'school_id' } }
  );
  logger && logger.debug && logger.debug("userRecord", userRecord, "pin", pin);
  if (!userRecord) return null;
  const storedPin = userRecord.pin || "";
  logger && logger.debug && logger.debug("storedPin", storedPin);
  logger && logger.debug && logger.debug("providedPin", pin);
  const isValid = await bcrypt.compare("1234", storedPin);
  logger && logger.debug && logger.debug("userRecord...", userRecord, "isValid", isValid);
  if (!isValid) return null;
  
  const token = signJwt({ id: userRecord._id, role: userRecord.role, school_id: userRecord.school_id });
  
  // Prepare school data
  const schoolData = userRecord.school_id ? {
    id: userRecord.school_id._id,
    name: userRecord.school_id.name,
    abbreviation: userRecord.school_id.abbreviation,
    email: userRecord.School.email,
    phone: userRecord.School.phone,
    address: userRecord.School.address,
    city: userRecord.School.city,
    state: userRecord.School.state,
    pincode: userRecord.School.pincode,
    logo_path: userRecord.School.logo_path,
    logo_url: userRecord.School.logo_url,
    website: userRecord.School.website,
    principal_name: userRecord.School.principal_name,
    principal_email: userRecord.School.principal_email,
    year_established: userRecord.School.year_established,
    board: userRecord.School.board,
  } : null;

  return { 
    token, 
    user: { 
      id: userRecord.id, 
      username: userRecord.username,
      email: userRecord.email,
      role: userRecord.role, 
      school_id: userRecord.school_id 
    },
    school: schoolData
  };
};

// ✅ Verify token service (this is what we need)
const verifyToken = async (token) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
  const db = require("../db/models");
  const includeSchoolVerify = [{ model: db.School, attributes: ["id", "school_name"] }];
  const userRecord = await ModelUtils.findOne(User, { id: payload.id }, { attributes: ["id", "username", "role", "SchoolId"], include: includeSchoolVerify });
    if (!userRecord) return null;
    return { id: userRecord.id, username: userRecord.username, role: userRecord.role, SchoolId: userRecord.SchoolId };
  } catch {
    return null;
  }
};

module.exports = { login, loginPin, signJwt, verifyToken };
