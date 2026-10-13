"use strict";

const { School, User } = require("../db/models");
const ModelUtils = require("../utils/ModelUtils");
const bcrypt = require("bcryptjs");
const { seedNewSchool } = require("../db/mongo/seeders/school.seeder");
const { ValidationError, ConflictError, NotFoundError, DatabaseError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");

const RESERVED_SCHOOL_SLUGS = new Set(["admin", "api", "www", "mail", "smtp", "cdn", "assets"]);

const normalizeSlug = (value) => String(value || "").trim();

const validateSlug = (value) => {
  const slug = normalizeSlug(value);
  if (slug !== slug.toLowerCase()) throw new ValidationError("Slug must be lowercase");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ValidationError("Slug must be lowercase letters, numbers, and single hyphens");
  if (RESERVED_SCHOOL_SLUGS.has(slug)) throw new ValidationError("This school slug is reserved");
  return slug;
};

const registerSchool = async ({ school, admin }) => {
  try {
    console.log("registerSchool received school:", JSON.stringify(school, null, 2));
    if (
      !school?.school_name ||
      !school?.school_code ||
      !school?.slug
    ) {
      throw new ValidationError("Missing required fields: school_name, school_code, slug");
    }

    const safeSchool = { ...school, slug: validateSlug(school.slug) };
    const existingSlug = await School.findOne({ slug: safeSchool.slug }).lean();
    if (existingSlug) throw new ConflictError("School slug already exists");

    const schoolRecord = await ModelUtils.createAndReturn(School, safeSchool);

    if (admin) {
      const existingUser = await ModelUtils.findOne(User, { school_id: schoolRecord._id, username: admin.username });
      if (existingUser) {
        throw new ConflictError("Admin user already exists for this school");
      }

      await seedNewSchool({
        schoolId: schoolRecord._id,
        slug: schoolRecord.slug,
        name: schoolRecord.school_name,
        admin: { ...admin, role: "ADMIN" },
      });
    } else {
      await seedNewSchool({
        schoolId: schoolRecord._id,
        slug: schoolRecord.slug,
        name: schoolRecord.school_name,
        admin: null,
      });
    }

    return success(schoolRecord._id);
  } catch (error) {
    return failure(error);
  }
};

const getSchool = async () => {
  try {
    const school = await ModelUtils.findOne(School, {});
    return success(school);
  } catch (error) {
    return failure(error);
  }
};

const listSchools = async () => {
  try {
    const schools = await School.find({}).sort({ createdAt: -1 }).lean();
    return success(schools);
  } catch (error) {
    return failure(error);
  }
};

const createSchoolRecord = async (data) => {
  try {
    const schoolName = String(data?.school_name || data?.name || "").trim();
    const slug = validateSlug(data?.slug);

    if (!schoolName) {
      throw new ValidationError("School name is required");
    }

    const exists = await School.findOne({ slug }).lean();
    if (exists) {
      throw new ConflictError("School slug already exists");
    }

    const schoolCode = String(data.school_code || slug.toUpperCase()).trim().toUpperCase();
    const codeExists = await School.findOne({ school_code: schoolCode }).lean();
    if (codeExists) {
      throw new ConflictError("School code already exists");
    }

    const created = await School.create({
      school_name: schoolName,
      name: schoolName,
      school_code: schoolCode,
      slug,
      status: data.status === "inactive" ? "inactive" : "active",
      abbreviation: data.abbreviation || "",
      logo_url: data.logo_url || "",
      campus_image_url: data.campus_image_url || "",
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      branding: {
        tagline: String(data.branding?.tagline || "").trim() || undefined,
        description: String(data.branding?.description || "").trim() || undefined,
      },
    });

    try {
      await seedNewSchool({
        schoolId: created._id,
        slug: created.slug,
        name: created.school_name,
        admin: data.admin || null,
      });
    } catch (seedError) {
      if (seedError && typeof seedError === "object") {
        seedError.schoolProvisioningContext = {
          schoolId: String(created._id),
          slug: created.slug,
          operation: "seedNewSchool",
        };
      }
      throw seedError;
    }

    return success(created);
  } catch (error) {
    return failure(error);
  }
};

const updatePlatformSchool = async (schoolId, data) => {
  try {
    const allowed = ["school_name", "name", "status", "abbreviation", "logo_url", "campus_image_url", "email", "phone", "address"];
    const update = {};
    for (const key of allowed) if (data[key] !== undefined) update[key] = data[key];
    if (data.branding?.tagline !== undefined) update["branding.tagline"] = String(data.branding.tagline).trim().slice(0, 120);
    if (data.branding?.description !== undefined) update["branding.description"] = String(data.branding.description).trim().slice(0, 500);
    if (update.school_name && !update.name) update.name = update.school_name;
    if (update.name && !update.school_name) update.school_name = update.name;
    if (update.status && !["active", "inactive"].includes(update.status)) throw new ValidationError("Status must be active or inactive");

    const updated = await School.findByIdAndUpdate(schoolId, { $set: update }, { new: true, runValidators: true }).lean();
    if (!updated) throw new NotFoundError("School");

    return success(updated);
  } catch (error) {
    return failure(error);
  }
};

const listSchoolAdministrators = async (schoolId) => {
  try {
    const administrators = await User.find({ school_id: schoolId, role: { $in: ["ADMIN", "SCHOOL_ADMIN"] } })
      .select("_id username email role createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return success(administrators);
  } catch (error) {
    return failure(error);
  }
};

const updateSchoolAdministratorPassword = async (schoolId, administratorId, password) => {
  try {
    if (!schoolId || !administratorId || typeof password !== "string" || password.length < 8) {
      throw new ValidationError("A school administrator and a password of at least 8 characters are required");
    }
    const hashedPassword = bcrypt.hashSync(password, 12);
    const result = await User.updateOne(
      { _id: administratorId, school_id: schoolId, role: { $in: ["ADMIN", "SCHOOL_ADMIN"] } },
      { $set: { password: hashedPassword } },
    );
    return success(result.matchedCount ? { id: administratorId } : null);
  } catch (error) {
    return failure(error);
  }
};

const createSchoolAdministrator = async (schoolId, data) => {
  try {
    const username = String(data?.username || "").trim();
    const password = typeof data?.password === "string" ? data.password : "";
    if (!schoolId || !username || password.length < 8) throw new ValidationError("Username and a password of at least 8 characters are required");
    const existing = await User.findOne({ username }).lean();
    if (existing) throw new ConflictError("Username already exists");

    const administrator = await User.create({
      username,
      email: String(data.email || "").trim(),
      password: bcrypt.hashSync(password, 12),
      role: "SCHOOL_ADMIN",
      school_id: schoolId,
    });

    return success(administrator);
  } catch (error) {
    return failure(error);
  }
};

const updateSchoolAdministrator = async (schoolId, administratorId, data) => {
  try {
    const { email } = data || {};
    if (!email) throw new ValidationError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("Please enter a valid email address");

    const updated = await User.findOneAndUpdate(
      { _id: administratorId, school_id: schoolId, role: { $in: ["ADMIN", "SCHOOL_ADMIN"] } },
      { $set: { email: email.toLowerCase() } },
      { new: true }
    ).select("_id username email role");

    if (!updated) return success(null);
    return success(updated);
  } catch (error) {
    return failure(error);
  }
};

const deleteSchoolAdministrator = async (schoolId, administratorId) => {
  try {
    const deleted = await User.findOneAndDelete({
      _id: administratorId,
      school_id: schoolId,
      role: { $in: ["ADMIN", "SCHOOL_ADMIN"] },
    }).select("_id");

    if (!deleted) return success(null);
    return success(deleted);
  } catch (error) {
    return failure(error);
  }
};

const getSchoolById = async (schoolId) => {
  try {
    if (!schoolId) throw new ValidationError("School ID required");
    const school = await ModelUtils.findOne(School, { _id: schoolId });
    if (!school) throw new NotFoundError("School");
    return success(school);
  } catch (error) {
    return failure(error);
  }
};

const updateSchool = async (schoolId, updateData) => {
  try {
    if (!schoolId) throw new ValidationError("School ID required");

    const allowedFields = [
      "school_name",
      "name",
      "abbreviation",
      "email",
      "phone",
      "contact_number",
      "address",
      "city",
      "state",
      "pincode",
      "logo_path",
      "logo_url",
      "campus_image_url",
      "website",
      "principal_name",
      "principal_email",
      "year_established",
      "board",
    ];

    const filteredData = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    });

    if (filteredData.school_name) {
      filteredData.name = filteredData.school_name;
    }
    if (filteredData.name && !filteredData.school_name) {
      filteredData.school_name = filteredData.name;
    }

    if (filteredData.contact_number) {
      filteredData.phone = filteredData.contact_number;
    }
    if (filteredData.phone && !filteredData.contact_number) {
      filteredData.contact_number = filteredData.phone;
    }

    const school = await getSchoolById(schoolId);
    if (school.error) return school;
    if (!school.data) throw new NotFoundError("School");

    const updated = await ModelUtils.updateAndReturn(School, { _id: schoolId }, filteredData);
    return success(updated && updated.rows && updated.rows.length ? updated.rows[0] : updated);
  } catch (error) {
    return failure(error);
  }
};

const findSchoolByCode = async (schoolCode) => {
  try {
    const school = await ModelUtils.findOne(School, { school_code: schoolCode });
    return success(school);
  } catch (error) {
    return failure(error);
  }
};

const findSchoolByEmail = async (email) => {
  try {
    const school = await ModelUtils.findOne(School, { email });
    return success(school);
  } catch (error) {
    return failure(error);
  }
};

const findAdmin = async (schoolId, username) => {
  try {
    const admin = await ModelUtils.findOne(User, { school_id: schoolId, username });
    return success(admin);
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  registerSchool,
  getSchool,
  listSchools,
  createSchoolRecord,
  updatePlatformSchool,
  listSchoolAdministrators,
  createSchoolAdministrator,
  updateSchoolAdministrator,
  deleteSchoolAdministrator,
  updateSchoolAdministratorPassword,
  getSchoolById,
  updateSchool,
  findSchoolByCode,
  findSchoolByEmail,
  findAdmin,
  validateSlug,
};