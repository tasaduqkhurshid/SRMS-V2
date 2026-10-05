"use strict";

const accountId = String(process.env.R2_ACCOUNT_ID || '').trim();
const endpoint = String(process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '')).trim();
const accessKeyId = String(process.env.R2_ACCESS_KEY_ID || '').trim();
const secretAccessKey = String(process.env.R2_SECRET_ACCESS_KEY || '').trim();
const bucketName = String(process.env.R2_BUCKET_NAME || 'sms-storage').trim();
const requested = String(process.env.R2_ENABLED || 'false').toLowerCase() === 'true';
const enabled = requested && Boolean(endpoint && accessKeyId && secretAccessKey && bucketName);

module.exports = Object.freeze({
  requested,
  enabled,
  endpoint,
  bucketName,
  accessKeyId,
  secretAccessKey,
  publicBaseUrl: String(process.env.R2_PUBLIC_BASE_URL || '').trim().replace(/\/$/, ''),
});
