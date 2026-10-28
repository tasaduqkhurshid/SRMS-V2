"use strict";

const db = require('../models');
const { seedSystem } = require('./seeders/system.seeder');
const { seedExistingSchools } = require('./seeders/school.seeder');
const { seedDemo } = require('./seed');

async function run() {
  try {
    await db.connectDB();
    await seedSystem(db);
    const provisionedSchools = await seedExistingSchools(db);
    console.log(`School defaults checked for ${provisionedSchools} tenant(s)`);

    if (process.env.NODE_ENV === 'production') {
      console.log('Production seed completed (system and school defaults only)');
      return;
    }
    if (process.env.SEED_DEMO_DATA !== 'true') {
      console.log('Demo seeding skipped because SEED_DEMO_DATA is not true');
      return;
    }

    await seedDemo();
  } catch (error) {
    console.error('Mongo seed failed:', error);
    process.exitCode = 1;
  } finally {
    await db.mongoose.connection.close();
  }
}

if (require.main === module) run();
module.exports = { run };
