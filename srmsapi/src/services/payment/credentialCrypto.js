"use strict";

const crypto = require("node:crypto");
const keyFromEnv = () => {
  const raw = process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY || "";
  if (/^[a-f0-9]{64}$/i.test(raw)) return Buffer.from(raw, "hex");
  try {
    const key = Buffer.from(raw, "base64");
    return key.length === 32 ? key : null;
  } catch { return null; }
};
const encrypt = (value) => {
  if (!value) return "";
  const key = keyFromEnv();
  if (!key) throw new Error("Payment credential encryption is unavailable");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${ciphertext.toString("base64url")}`;
};
const decrypt = (value) => {
  if (!value) return "";
  const key = keyFromEnv();
  if (!key) throw new Error("Payment credential encryption is unavailable");
  const [version, iv, tag, ciphertext] = String(value).split(":");
  if (version !== "v1" || !iv || !tag || !ciphertext) throw new Error("Stored payment credential cannot be decrypted");
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
  } catch { throw new Error("Stored payment credential cannot be decrypted"); }
};
module.exports = { encrypt, decrypt };
