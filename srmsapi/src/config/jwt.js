"use strict";

const PLACEHOLDER_SECRETS = new Set([
  "dev_secret",
  "dev_secret_change_me",
  "replace-with-a-long-random-secret",
  "generate_a_secure_random_secret",
]);
const isPlaceholderSecret = (value) =>
  PLACEHOLDER_SECRETS.has(value.toLowerCase()) || /^(CHANGE|SET|GENERATE|REPLACE|YOUR|EXAMPLE|PLACEHOLDER)[_-]/i.test(value);

const getJwtSecret = () => {
  const configured = String(process.env.JWT_SECRET || "").trim();
  if (!configured || configured.length < 32 || isPlaceholderSecret(configured)) {
    throw new Error("JWT_SECRET must be set to a non-placeholder value of at least 32 characters");
  }
  return configured;
};

const validateRuntimeConfig = () => {
  getJwtSecret();
  if (process.env.NODE_ENV !== "production") return;

  const { getDatabaseConfig } = require("./database");
  const database = getDatabaseConfig();
  if (!database.username || !database.password || database.password.length < 16 || database.password.toLowerCase() === "password" || isPlaceholderSecret(database.password)) {
    throw new Error("Production requires DB_USERNAME and a non-default DB_PASSWORD of at least 16 characters");
  }
  if (!database.replicaSet) {
    throw new Error("Production requires DB_REPLICA_SET for transaction-capable MongoDB deployments");
  }
  const superAdminPassword = String(process.env.SUPER_ADMIN_PASSWORD || "");
  if (superAdminPassword.length < 16 || isPlaceholderSecret(superAdminPassword)) {
    throw new Error("Production requires SUPER_ADMIN_PASSWORD to be a non-placeholder value of at least 16 characters");
  }
  if (String(process.env.MONGO_DEBUG || "false").toLowerCase() === "true") {
    throw new Error("MONGO_DEBUG must be false in production to avoid logging sensitive database values");
  }

  if (String(process.env.R2_ENABLED || "false").trim().toLowerCase() === "true") {
    const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_PRIVATE_BUCKET_NAME"];
    const missing = required.filter((name) => !String(process.env[name] || "").trim());
    if (missing.length) {
      throw new Error(`R2_ENABLED=true requires: ${missing.join(", ")}`);
    }
  }
};

module.exports = { getJwtSecret, validateRuntimeConfig };