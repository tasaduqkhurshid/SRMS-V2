const SchoolService = require("../services/SchoolService");

exports.register = async (req, res) => {
  try {
    console.log("Received registration request:", req.body);
    const { school: schoolData, admin: adminData } = req.body;
    
    const school = {
      school_name: schoolData?.school_name,
      school_code: schoolData?.school_code,
      slug: schoolData?.slug || schoolData?.school_code?.toLowerCase(),
      status: schoolData?.status || 'active',
      address: schoolData?.address || null,
      contact_number: schoolData?.contact_number || null,
      phone: schoolData?.contact_number || null,
      email: schoolData?.email || null,
    };
    
    const admin = {
      username: adminData?.username,
      password: adminData?.password,
      pin: adminData?.pin || null,
    };
    const existingSchool = await SchoolService.findSchoolByCode(school.school_code);
    console.log("Validating registration data:", { school, admin });
    
    if (existingSchool) {
      return res.status(400).json({ message: "School code already exists" });
    }
    console.log("Checking for existing school by email:", school.email);
    if (school.email) {
      const existingSchoolByEmail = await SchoolService.findSchoolByEmail(school.email);
      if (existingSchoolByEmail) {
        return res.status(400).json({ message: "School email already exists" });
      }
    }
    console.log("Registering school:", school); 
    console.log("Admin details:", admin); 
    const id = await SchoolService.register({ school, admin });
    res.json({ ok: true, school_id: id });
  } catch (e) {
    console.log("Error in registration:", e);
    res.status(400).json({ message: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const s = req.school;
    if (!s) return res.status(404).json({ success: false, message: "School not found" });
    res.json({ school: s });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/**
 * Get school by ID (from session or params)
 */
exports.getById = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(404).json({ success: false, message: "School not found" });
    }
    if (req.params.id && String(req.params.id) !== String(schoolId)) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const school = await SchoolService.getSchoolById(schoolId);
    res.json({ success: true, data: school });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/**
 * Update school details
 */
exports.update = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(404).json({ success: false, message: "School not found" });
    }
    if (req.params.id && String(req.params.id) !== String(schoolId)) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const updated = await SchoolService.updateSchool(schoolId, req.body);
    
    // Update session if it exists
    if (req.session && req.session.school) {
      Object.assign(req.session.school, updated.dataValues);
    }

    res.json({ success: true, message: "School updated successfully", data: updated });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
