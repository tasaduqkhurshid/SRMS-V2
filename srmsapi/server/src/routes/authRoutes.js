
// routes/auth.routes.js
const router = require("express").Router();
const { login, loginViaPin, verifyJWTToken, logout } = require("../controllers/AuthController");

router.post("/login", login);
router.post("/login-pin", loginViaPin);
router.get("/verify-token", verifyJWTToken);
router.post("/logout", logout);

module.exports = router;

