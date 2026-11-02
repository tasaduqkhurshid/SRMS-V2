"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { getDatabaseConfig } = require("../src/config/database");
const { validateRuntimeConfig } = require("../src/config/jwt");

const ENV_KEYS = [
  "NODE_ENV", "JWT_SECRET", "DB_TYPE", "DB_HOST", "DB_PORT", "DB_NAME",
  "DB_USERNAME", "DB_PASSWORD", "DB_AUTH_SOURCE", "DB_REPLICA_SET",
  "DB_DIRECT_CONNECTION", "SMS_API_IN_DOCKER", "MONGO_DEBUG", "SUPER_ADMIN_PASSWORD", "R2_ENABLED", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY", "R2_PRIVATE_BUCKET_NAME",
];

test("database targets and production secrets are validated explicitly", () => {
  const original = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  try {
    for (const key of ENV_KEYS) delete process.env[key];

    process.env.DB_TYPE = "local";
    process.env.SMS_API_IN_DOCKER = "true";
    assert.equal(getDatabaseConfig().host, "host.docker.internal");

    process.env.DB_TYPE = "docker";
    process.env.DB_USERNAME = "srms admin";
    process.env.DB_PASSWORD = "p@ss:word";
    assert.equal(getDatabaseConfig().host, "mongodb");
    assert.equal(getDatabaseConfig().replicaSet, "rs0");
    assert.match(getDatabaseConfig().uri, /srms%20admin:p%40ss%3Aword@mongodb/);

    process.env.DB_TYPE = "local";
    process.env.DB_HOST = "127.0.0.1";
    process.env.DB_DIRECT_CONNECTION = "true";
    process.env.DB_REPLICA_SET = "";
    assert.match(getDatabaseConfig().uri, /directConnection=true/);
    assert.equal(getDatabaseConfig().replicaSet, "");
    process.env.DB_REPLICA_SET = "rs0";
    assert.throws(getDatabaseConfig, /cannot be combined with DB_REPLICA_SET/);
    delete process.env.DB_DIRECT_CONNECTION;
    delete process.env.DB_REPLICA_SET;
    delete process.env.DB_HOST;

    process.env.NODE_ENV = "production";
    assert.throws(validateRuntimeConfig, /JWT_SECRET/);
    process.env.JWT_SECRET = crypto.randomBytes(32).toString("base64");
    assert.throws(validateRuntimeConfig, /DB_PASSWORD/);

    process.env.DB_USERNAME = "srms_admin";
    process.env.DB_PASSWORD = "CHANGE_THIS_PASSWORD";
    assert.throws(validateRuntimeConfig, /DB_PASSWORD/);
    process.env.DB_PASSWORD = crypto.randomBytes(24).toString("hex");
    process.env.DB_REPLICA_SET = "rs0";
    process.env.SUPER_ADMIN_PASSWORD = "platform-admin-production-safe";
    assert.doesNotThrow(validateRuntimeConfig);

    process.env.MONGO_DEBUG = "true";
    assert.throws(validateRuntimeConfig, /MONGO_DEBUG must be false/);
    delete process.env.MONGO_DEBUG;

    process.env.R2_ENABLED = "true";
    assert.throws(validateRuntimeConfig, /R2_ENABLED=true requires/);
    process.env.R2_ACCOUNT_ID = "test-account";
    process.env.R2_ACCESS_KEY_ID = "test-access";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret";
    process.env.R2_PRIVATE_BUCKET_NAME = "private-bucket";
    assert.doesNotThrow(validateRuntimeConfig);
  } finally {
    for (const key of ENV_KEYS) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});