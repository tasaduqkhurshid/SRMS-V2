"use strict";

const fs = require('node:fs');
const path = require('node:path');
const db = require('../models');

const runMigrations = async () => {
  const migrationsDirectory = path.join(__dirname, 'migrations');
  const migrations = fs.readdirSync(migrationsDirectory)
    .filter((file) => /^\d+_.+\.js$/.test(file))
    .sort();
  const tracking = db.mongoose.connection.db.collection('_migrations');
  await tracking.createIndex({ name: 1 }, { unique: true, name: 'unique_migration_name' });

  for (const file of migrations) {
    const completed = await tracking.findOne({ _id: file });
    if (completed) {
      console.log(`Skipping completed migration ${file}`);
      continue;
    }

    const migration = require(path.join(migrationsDirectory, file));
    if (typeof migration.up !== 'function') throw new Error(`Migration ${file} must export up(db)`);
    console.log(`Running migration ${file}`);
    await migration.up(db);
    try {
      await tracking.insertOne({ _id: file, name: file, appliedAt: new Date() });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }
};

const run = async () => {
  try {
    await db.connectDB();
    await runMigrations();
    console.log('Mongo migrations completed');
  } catch (error) {
    console.error('Mongo migrations failed:', error);
    process.exitCode = 1;
  } finally {
    await db.mongoose.connection.close();
  }
};

if (require.main === module) run();
module.exports = { runMigrations };
