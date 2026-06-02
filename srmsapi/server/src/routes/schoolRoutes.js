const r = require("express").Router();
const C = require("../controllers/SchoolController");

r.post("/register", C.register);
r.get("/me", C.me);
r.get("/:id", C.getById);
r.put("/:id", C.update);

module.exports = r;
