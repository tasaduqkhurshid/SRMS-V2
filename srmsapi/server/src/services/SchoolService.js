const { School, User } = require("../db/models");
const ModelUtils = require("../utils/ModelUtils");
const bcrypt = require("bcryptjs");

const RESERVED_SCHOOL_SLUGS = new Set(['admin', 'api', 'www', 'mail', 'smtp', 'cdn', 'assets']);

const normalizeSlug = (value) => String(value || '').trim();

const validateSlug = (value) => {
  const slug = normalizeSlug(value);
  if (slug !== slug.toLowerCase()) throw new Error('Slug must be lowercase');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Slug must be lowercase letters, numbers, and single hyphens');
  if (RESERVED_SCHOOL_SLUGS.has(slug)) throw new Error('This school slug is reserved');
  return slug;
};

async function register({ school, admin }) {
  if (
    !school?.school_name ||
    !school?.school_code ||
    !school?.slug ||
    !admin?.username ||
    !admin?.password
  )
    throw new Error("Missing required fields");

  const safeSchool = { ...school, slug: validateSlug(school.slug) };
  const existingSlug = await School.findOne({ slug: safeSchool.slug }).lean();
  if (existingSlug) throw new Error('School slug already exists');
  const schoolRecord = await ModelUtils.createAndReturn(School, safeSchool);

  const existingUser = await ModelUtils.findOne(User, { school_id: schoolRecord._id, username: admin.username });
  if (existingUser) {
    throw new Error("Admin user already exists for this school");
  }

  const hash = bcrypt.hashSync(admin.password, 10);
  const pinHash = admin.pin ? bcrypt.hashSync(admin.pin, 10) : null;
  await ModelUtils.createAndReturn(User, {
    username: admin.username,
    email: admin.email,
    password: hash,
    pin: pinHash,
    role: "ADMIN",
    school_id: schoolRecord._id,
  });
  return schoolRecord._id;
}

async function getSchool() {
  // return first school (plain object)
  return await ModelUtils.findOne(School, {});
}

async function listSchools() {
  return School.find({}).sort({ createdAt: -1 }).lean();
}

async function createSchoolRecord(data) {
  const schoolName = String(data?.school_name || data?.name || '').trim();
  const slug = validateSlug(data?.slug);
  if (!schoolName) throw new Error('School name is required');
  const exists = await School.findOne({ slug }).lean();
  if (exists) throw new Error('School slug already exists');
  const schoolCode = String(data.school_code || slug.toUpperCase()).trim().toUpperCase();
  const codeExists = await School.findOne({ school_code: schoolCode }).lean();
  if (codeExists) throw new Error('School code already exists');
  return School.create({
    school_name: schoolName,
    name: schoolName,
    school_code: schoolCode,
    slug,
    status: data.status === 'inactive' ? 'inactive' : 'active',
    abbreviation: data.abbreviation || '',
    logo_url: data.logo_url || '',
    campus_image_url: data.campus_image_url || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
  });
}

async function updatePlatformSchool(schoolId, data) {
  const allowed = ['school_name', 'name', 'status', 'abbreviation', 'logo_url', 'campus_image_url', 'email', 'phone', 'address'];
  const update = {};
  for (const key of allowed) if (data[key] !== undefined) update[key] = data[key];
  if (update.school_name && !update.name) update.name = update.school_name;
  if (update.name && !update.school_name) update.school_name = update.name;
  if (update.status && !['active', 'inactive'].includes(update.status)) throw new Error('Status must be active or inactive');
  return School.findByIdAndUpdate(schoolId, { $set: update }, { new: true, runValidators: true }).lean();
}

async function listSchoolAdministrators(schoolId) {
  return User.find({ school_id: schoolId, role: { $in: ['ADMIN', 'SCHOOL_ADMIN'] } })
    .select('_id username email role createdAt')
    .sort({ createdAt: -1 })
    .lean();
}

async function createSchoolAdministrator(schoolId, data) {
  const username = String(data?.username || '').trim();
  const password = typeof data?.password === 'string' ? data.password : '';
  if (!schoolId || !username || password.length < 8) throw new Error('Username and a password of at least 8 characters are required');
  const existing = await User.findOne({ username }).lean();
  if (existing) throw new Error('Username already exists');
  return User.create({
    username,
    email: String(data.email || '').trim(),
    password: bcrypt.hashSync(password, 12),
    role: 'SCHOOL_ADMIN',
    school_id: schoolId,
  });
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
    'logo_path', 'logo_url', 'campus_image_url', 'website', 'principal_name',
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

module.exports = { register, getSchool, listSchools, createSchoolRecord, updatePlatformSchool, listSchoolAdministrators, createSchoolAdministrator, getSchoolById, updateSchool, findSchoolByCode, findSchoolByEmail, findAdmin, validateSlug };
