"use strict";

const fs = require('node:fs');
const path = require('node:path');
const db = require('../models');
const tableNames = require('../tableNames');
const isMigrationFile = (file) => /^(?:\d+_.+|\d{17}-.+)\.js$/.test(file);

const runMigrations = async () => {
  const migrationsDirectory = path.join(__dirname, 'migrations');
  const migrations = fs.readdirSync(migrationsDirectory)
    .filter(isMigrationFile)
    .sort();
  const tracking = db.mongoose.connection.db.collection(tableNames.migrationHistory);
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

const rollbackLastMigration = async () => {
  const tracking = db.mongoose.connection.db.collection(tableNames.migrationHistory);
  const latest = await tracking.find({}).sort({ appliedAt: -1, _id: -1 }).limit(1).next();
  if (!latest) {
    console.log('No completed migrations to roll back');
    return null;
  }

  const migrationsDirectory = path.join(__dirname, 'migrations');
  const migrationFile = latest.name || latest._id;
  if (typeof migrationFile !== 'string' || !isMigrationFile(migrationFile)) {
    throw new Error(`Cannot roll back ${latest._id}: invalid migration filename in tracking record`);
  }
  const migrationPath = path.join(migrationsDirectory, migrationFile);
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Cannot roll back ${latest._id}: migration file is missing`);
  }

  const migration = require(migrationPath);
  if (typeof migration.down !== 'function') {
    throw new Error(`Cannot safely roll back ${latest._id}: it does not define down(db)`);
  }

  console.log(`Rolling back migration ${latest._id}`);
  await migration.down(db);
  await tracking.deleteOne({ _id: latest._id });
  console.log(`Rolled back migration ${latest._id}`);
  return latest._id;
};

const run = async () => {
  const action = process.argv[2] || 'up';
  try {
    await db.connectDB();
    if (action === 'up') {
      await runMigrations();
      console.log('Mongo migrations completed');
    } else if (action === 'down') {
      await rollbackLastMigration();
    } else {
      throw new Error(`Unknown migration action "${action}". Use "up" or "down".`);
    }
  } catch (error) {
    console.error('Mongo migrations failed:', error);
    process.exitCode = 1;
  } finally {
    await db.mongoose.connection.close();
  }
};

if (require.main === module) run();
module.exports = { runMigrations, rollbackLastMigration };
