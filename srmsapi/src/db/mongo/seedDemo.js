"use strict";

const db = require('../models');
const { seedDemo } = require('./seed');

async function run() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seeders are disabled in production');
  }
  try {
    await db.connectDB();
    await seedDemo();
  } catch (error) {
    console.error('Mongo demo seed failed:', error);
    process.exitCode = 1;
  } finally {
    await db.mongoose.connection.close();
  }
}

if (require.main === module) run();
module.exports = { run };
