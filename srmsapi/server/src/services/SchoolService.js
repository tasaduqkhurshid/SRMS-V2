const { School, User } = require("../db/models");
const ModelUtils = require("../utils/ModelUtils");
const bcrypt = require("bcryptjs");

async function register({ school, admin }) {
  console.log("Registering school:", school);
  if (
    !school?.school_name ||
    !school?.school_code ||
    !admin?.username ||
    !admin?.password
  )
    throw new Error("Missing required fields");
  console.log("Registering school:", school);
  console.log("Admin details:", admin);

  const schoolRecord = await ModelUtils.createAndReturn(School, school);
  console.log("Created school record:", schoolRecord);

  const existingUser = await ModelUtils.findOne(User, { school_id: schoolRecord._id, username: admin.username });
  if (existingUser) {
    throw new Error("Admin user already exists for this school");
  }

  const hash = bcrypt.hashSync(admin.password, 10);
  await ModelUtils.createAndReturn(User, {
    username: admin.username,
    password: hash,
    pin: admin.pin || null,
    role: "ADMIN",
    school_id: schoolRecord._id,
  });
  return schoolRecord._id;
}

async function getSchool() {
  // return first school (plain object)
  return await ModelUtils.findOne(School, {});
}

/**
 * Get school by ID
 */
async function getSchoolById(schoolId) {
  if (!schoolId) throw new Error("School ID required");
  return await ModelUtils.findOne(School, { _id: schoolId });
}

/**
 * Update school details
 */
async function updateSchool(schoolId, updateData) {
  if (!schoolId) throw new Error("School ID required");
  
  const allowedFields = [
    'school_name', 'name', 'abbreviation', 'email', 'phone',
    'contact_number', 'address', 'city', 'state', 'pincode',
    'logo_path', 'logo_url', 'website', 'principal_name',
    'principal_email', 'year_established', 'board'
  ];

  // Filter only allowed fields
  const filteredData = {};
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key) && updateData[key] !== undefined) {
      filteredData[key] = updateData[key];
    }
  });

  // Sync school_name and name
  if (filteredData.school_name) {
    filteredData.name = filteredData.school_name;
  }
  if (filteredData.name && !filteredData.school_name) {
    filteredData.school_name = filteredData.name;
  }

  // Sync contact_number and phone
  if (filteredData.contact_number) {
    filteredData.phone = filteredData.contact_number;
  }
  if (filteredData.phone && !filteredData.contact_number) {
    filteredData.contact_number = filteredData.phone;
  }

  const school = await getSchoolById(schoolId);
  if (!school) throw new Error("School not found");

  const updated = await ModelUtils.updateAndReturn(School, { _id: schoolId }, filteredData);
  return updated && updated.rows && updated.rows.length ? updated.rows[0] : updated;
}

async function findSchoolByCode(schoolCode) {
  const school = await ModelUtils.findOne(School, {
    school_code: schoolCode
  });
  console.log("Found school by code:", school);
  return school;
}

async function findSchoolByEmail(email) {
  return await ModelUtils.findOne(School, {
    email
  });
}

async function findAdmin(schoolId, username) {
  return await ModelUtils.findOne(User, { school_id: schoolId, username });
}

module.exports = { register, getSchool, getSchoolById, updateSchool, findSchoolByCode, findSchoolByEmail, findAdmin };
