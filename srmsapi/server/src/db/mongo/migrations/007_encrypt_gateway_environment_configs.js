"use strict";

const { encrypt, decrypt } = require("../../../services/payment/credentialCrypto");

const up = async (db) => {
  const catalog = new Map((await db.Gateway.find({}).lean()).map((row) => [String(row._id), row]));
  const rows = await db.SchoolGateway.collection.find({}).toArray();
  for (const row of rows) {
    const gateway = catalog.get(String(row.gateway_id));
    const environment = row.environment === "live" ? "live" : "test";
    let parsed = {};
    if (row.configuration_encrypted) parsed = JSON.parse(decrypt(row.configuration_encrypted));
    else if (row.credentials_encrypted) parsed = JSON.parse(decrypt(row.credentials_encrypted));

    const isEnvironmentMap = parsed.test || parsed.live;
    const valuesByEnvironment = isEnvironmentMap ? parsed : { [environment]: { credentials: parsed, configuration: {} } };
    const active = valuesByEnvironment[environment] || { credentials: {}, configuration: {} };
    active.credentials ||= {};
    active.configuration ||= {};
    const fields = gateway?.configurationFields || [];
    const putMapped = (key, value, forceSecret) => {
      if (!value) return;
      const field = fields.find((item) => item.srmField === key || item.providerField === key);
      if (field) (field.secret || forceSecret ? active.credentials : active.configuration)[field.srmField] = value;
      else active.credentials[key] = value;
    };
    for (const field of fields) {
      const oldValue = parsed[field.srmField] ?? parsed[field.providerField];
      if (oldValue && !active.credentials[field.srmField] && !active.configuration[field.srmField]) putMapped(field.srmField, oldValue, field.secret);
    }
    if (row.key_id) putMapped("keyId", row.key_id, false);
    if (row.key_secret_encrypted) putMapped("keySecret", decrypt(row.key_secret_encrypted), true);
    if (row.webhook_secret_encrypted) putMapped("webhookSecret", decrypt(row.webhook_secret_encrypted), true);
    valuesByEnvironment[environment] = active;
    const hasValues = Object.values(valuesByEnvironment).some((entry) => Object.keys(entry.credentials || {}).length || Object.keys(entry.configuration || {}).length);
    await db.SchoolGateway.collection.updateOne({ _id: row._id }, {
      $set: { configuration_encrypted: hasValues ? encrypt(JSON.stringify(valuesByEnvironment)) : "" },
      $unset: { credentials_encrypted: "", key_id: "", key_secret_encrypted: "", webhook_secret_encrypted: "" },
    });
  }
  await db.SchoolGateway.collection.createIndex({ school_id: 1, gateway_id: 1 }, { unique: true, name: "unique_school_gateway_provider" });
};

module.exports = { up };
