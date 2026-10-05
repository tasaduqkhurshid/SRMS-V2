// middleware/auth.js
const jwt = require("jsonwebtoken");
const { User, Student } = require("../db/models");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const getToken = (req) => {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
};

const authenticateJwt = async (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (payload.token_type === "student") {
      const student = await Student.findById(payload.student_id || payload.id).lean();
      if (!student || String(student.school_id) !== String(payload.school_id) ||
          String(student.school_id) !== String(req.schoolId)) {
        return res.status(401).json({ error: "Student account no longer exists" });
      }

      req.user = {
        id: student._id,
        student_id: student._id,
        role: "student",
        school_id: student.school_id,
        auth_type: "student",
      };
      return next();
    }

    const user = await User.findById(payload.id).lean();

    const isSuperAdmin = String(user?.role).toUpperCase() === "SUPER_ADMIN";
    const validPortalIdentity = req.isPlatformHost
      ? isSuperAdmin && !user.school_id
      : !isSuperAdmin && String(user.school_id) === String(req.schoolId);
    if (!user || !validPortalIdentity) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      school_id: user.school_id,
      auth_type: "user",
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const requireStudentAuth = (req, res, next) =>
  req.user?.auth_type === "student"
    ? next()
    : res.status(req.user ? 403 : 401).json({ error: "Student authentication required" });

const requireSchoolAdmin = (req, res, next) =>
  req.user?.auth_type === "user" && ["ADMIN", "SCHOOL_ADMIN"].includes(String(req.user.role).toUpperCase()) &&
  !req.isPlatformHost && String(req.user.school_id) === String(req.schoolId)
    ? next()
    : res.status(req.user ? 403 : 401).json({ error: "School administrator authentication required" });

const requireSuperAdmin = (req, res, next) =>
  req.isPlatformHost && req.user?.auth_type === "user" && String(req.user.role).toUpperCase() === "SUPER_ADMIN"
    ? next()
    : res.status(req.user ? 403 : 401).json({ error: "Super administrator authentication required" });


const requireAuth = (req, res, next) =>
  req.user ? next() : res.status(401).json({ error: "Authentication required" });

const authorizeRoles = (...roles) => (req, res, next) =>
  !req.user
    ? res.status(401).json({ error: "Authentication required" })
    : roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ error: "Forbidden" });

module.exports = { authenticateJwt, requireAuth, authorizeRoles, requireStudentAuth, requireSchoolAdmin, requireSuperAdmin };
