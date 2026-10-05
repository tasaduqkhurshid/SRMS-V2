"use strict";

const bcrypt = require('bcryptjs');

async function seedSystem(db) {
  const password = process.env.SUPER_ADMIN_PASSWORD ||
    (process.env.NODE_ENV === 'production' ? '' : 'platform-admin-local-only');
  if (!password) throw new Error('Set SUPER_ADMIN_PASSWORD before running system seeding in production');

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
