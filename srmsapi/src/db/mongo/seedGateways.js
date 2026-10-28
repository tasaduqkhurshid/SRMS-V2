"use strict";

const db = require('../models');
const { seedGatewayCatalog } = require('./seeders/gateway.seeder');

async function run() {
  try {
    await db.connectDB();
    const count = await seedGatewayCatalog(db);
    console.log(`Payment gateway catalog checked (${count} providers)`);
  } catch (error) {
    console.error('Payment gateway seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await db.mongoose.connection.close();
  }
}

if (require.main === module) run();
module.exports = { run };
