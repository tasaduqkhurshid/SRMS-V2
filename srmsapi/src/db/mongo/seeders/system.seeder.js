"use strict";

const bcrypt = require('bcryptjs');
const { seedGatewayCatalog } = require('./gateway.seeder');
const { seedSupportTicketDefaults } = require('./20261102090738552-support-ticket-defaults.seeder');

async function seedSystem(db) {
  await seedGatewayCatalog(db);
  await seedSupportTicketDefaults(db);
  const password = String(process.env.SUPER_ADMIN_PASSWORD || "");
  if (!password) throw new Error('Set SUPER_ADMIN_PASSWORD before running system seeding');

  await db.User.findOneAndUpdate(
    { username: 'platform-admin' },
    {
      $setOnInsert: {
        username: 'platform-admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'platform-admin@sms.local',
        password: bcrypt.hashSync(password, 12),
        role: 'SUPER_ADMIN',
        school_id: null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

module.exports = { seedSystem };
