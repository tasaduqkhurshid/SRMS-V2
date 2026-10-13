"use strict";

const AuthService = require("../../services/student/auth.service");
const { NotFoundError, AuthenticationError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const manifest = (req, res) => {
  if (!req.school) {
    throw new NotFoundError("School hostname not found");
  }
  const name = `${req.school.name || req.school.school_name} Student Portal`;
  res.set("Cache-Control", "private, no-store");
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Manifest retrieved",
    data: {
      name,
      short_name: req.school.abbreviation || req.school.slug,
      start_url: "/login",
      scope: "/",
      display: "standalone",
      background_color: "#f3f7fb",
      theme_color: "#1d4ed8",
      icons: [{ src: "/portal-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
    },
  });
};

const getSchoolBrand = asyncHandler(async (req, res, next) => {
  const result = await AuthService.getSchoolBrand(req.school);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("School");
  }
  res.set("Cache-Control", "private, no-store");
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "School brand retrieved", data: result.data });
});

const login = asyncHandler(async (req, res, next) => {
  const { studentId, password } = req.body || {};
  const result = await AuthService.login({ studentId, password, school: req.school });
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new AuthenticationError("Invalid credentials");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Login successful", data: result.data });
});

const logout = (_req, res) => {
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Logged out successfully" });
};

const me = asyncHandler(async (req, res, next) => {
  const result = await AuthService.me(req.user);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Profile retrieved", data: result.data });
});

module.exports = { manifest, getSchoolBrand, login, logout, me };