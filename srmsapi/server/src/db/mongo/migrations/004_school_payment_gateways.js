"use strict";

const { seedGatewayCatalog } = require('../seeders/gateway.seeder');

const up = async (db) => {
  await db.Gateway.collection.createIndex({ code: 1 }, { unique: true, name: 'unique_gateway_code' });
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
