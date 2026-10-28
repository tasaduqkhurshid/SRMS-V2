"use strict";

const { seedGatewayCatalog } = require('../seeders/gateway.seeder');

const up = async (db) => {
  // Gateway.code already declares the unique index in its schema. Recreating
  // the same key pattern under another name causes MongoDB IndexOptionsConflict.
  await db.Gateway.collection.createIndex({ isEnabled: 1, integrationStatus: 1 }, { name: 'platform_gateway_availability' });
  await db.SchoolGateway.collection.createIndex(
    { school_id: 1, gateway_id: 1 },
    { unique: true, name: 'unique_school_gateway_provider' },
  );
  await db.SchoolGateway.collection.createIndex(
    { school_id: 1, isEnabled: 1, configurationStatus: 1 },
    { name: 'school_gateway_readiness' },
  );
  await db.FeePayment.collection.createIndex(
    { school_id: 1, gateway_id: 1, createdAt: -1 },
    { name: 'school_gateway_payment_history' },
  );
  await seedGatewayCatalog(db);
};

module.exports = { up };
