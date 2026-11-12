"use strict";

const path = require("node:path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../../../../", ".env") });
dotenv.config();

const getEmailConfig = () => {
  const enabled = String(process.env.EMAIL_ENABLED || "true").toLowerCase() === "true";
  
  const host = String(process.env.EMAIL_HOST || "localhost").trim();
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = String(process.env.EMAIL_SECURE || "false").toLowerCase() === "true";
  
  const user = String(process.env.EMAIL_USER || "").trim();
  const pass = String(process.env.EMAIL_PASS || "").trim();
  
  const fromName = String(process.env.EMAIL_FROM_NAME || "SRMS Support").trim();
  const fromEmail = String(process.env.EMAIL_FROM_EMAIL || "support@srms.local").trim();
  
  const testEmail = String(process.env.EMAIL_TEST_EMAIL || "").trim();
  const useTestEmail = String(process.env.EMAIL_USE_TEST_EMAIL || "false").toLowerCase() === "true" && testEmail;
  
  return Object.freeze({
    enabled,
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : null,
    from: { name: fromName, email: fromEmail },
    testEmail: useTestEmail ? testEmail : null,
  });
};

module.exports = { getEmailConfig };