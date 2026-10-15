"use strict";

const accountId = String(process.env.R2_ACCOUNT_ID || "").trim();

const endpoint = String(
  process.env.R2_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : ""),
).trim();

const accessKeyId = String(process.env.R2_ACCESS_KEY_ID || "").trim();

const secretAccessKey = String(process.env.R2_SECRET_ACCESS_KEY || "").trim();

const privateBucketName = String(
  process.env.R2_PRIVATE_BUCKET_NAME || "",
).trim();

const publicBucketName = String(process.env.R2_PUBLIC_BUCKET_NAME || "").trim();

const requested =
  String(process.env.R2_ENABLED || "false")
    .trim()
    .toLowerCase() === "true";

const publicBaseUrl = String(process.env.R2_PUBLIC_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

const enabled =
  requested &&
  Boolean(endpoint && accessKeyId && secretAccessKey && privateBucketName);

module.exports = Object.freeze({
  requested,
  enabled,
  endpoint,
  privateBucketName,
  publicBucketName,
  accessKeyId,
  secretAccessKey,
  publicBaseUrl,
});
