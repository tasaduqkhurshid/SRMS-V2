// middleware/auth.js
const jwt = require("jsonwebtoken");
const { User } = require("../db/models");

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

    const user = await User.findById(payload.id).lean();

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      school_id: user.school_id,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


const requireAuth = (req, res, next) =>
  req.user ? next() : res.status(401).json({ error: "Authentication required" });

const authorizeRoles = (...roles) => (req, res, next) =>
  !req.user
    ? res.status(401).json({ error: "Authentication required" })
    : roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ error: "Forbidden" });

module.exports = { authenticateJwt, requireAuth, authorizeRoles };
