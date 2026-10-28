"use strict";

const tableNames = require("../../tableNames");

const up = async (db) => {
  await db.Gateway.collection.updateMany({}, { $unset: { preset: "", presetDraft: "" } });
  await db.SchoolGateway.collection.updateMany({}, { $unset: { presetVersion: "", inheritedFields: "", customizedFields: "", presetDefaultEnabled: "" } });
  await db.SchoolGateway.collection.deleteMany({ credentialsConfigured: { $ne: true }, isEnabled: { $ne: true }, key_id: { $in: ["", null] }, key_secret_encrypted: { $in: ["", null] }, webhook_secret_encrypted: { $in: ["", null] }, credentials_encrypted: { $in: ["", null] } });
  try { await db.Gateway.collection.dropIndex("gateway_preset_active_version"); } catch (error) { if (error.codeName !== "IndexNotFound") throw error; }
  const collections = await db.mongoose.connection.db.listCollections({ name: tableNames.gatewayPresetAuditLogs }).toArray();
  if (collections.length) await db.mongoose.connection.db.dropCollection(tableNames.gatewayPresetAuditLogs);
};
module.exports = { up };
