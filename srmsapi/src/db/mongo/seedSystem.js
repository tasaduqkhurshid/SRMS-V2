"use strict";

const db = require('../models');
const { seedSystem } = require('./seeders/system.seeder');

async function run() {
  try {
    await db.connectDB();
    await seedSystem(db);
    console.log('System seed completed');
  } catch (error) {
    console.error('System seed failed:', error);
    process.exitCode = 1;
  } finally {
    await db.mongoose.connection.close();
  }
}

if (require.main === module) run();
module.exports = { run };
