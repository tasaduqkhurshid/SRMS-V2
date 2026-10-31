const r = require("express").Router();
const C = require("../../controllers/srms-school/SchoolController");

// Public route - no authentication required (uses tenant resolution)
r.get("/brand", C.getSchoolBrand);
r.get("/brand", C.getSchoolBrand);

// Protected routes - require authentication
r.post("/register", C.register);
r.get("/me", C.me);
r.get("/:id", C.getById);
r.put("/:id", C.update);

module.exports = r;
