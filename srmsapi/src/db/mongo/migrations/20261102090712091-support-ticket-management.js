"use strict";

const tableNames = require("../../tableNames");

const createIndexSafe = async (collection, keys, options) => {
  try {
    await collection.createIndex(keys, options);
  } catch (error) {
    if (error.code === 86 || error.codeName === 'IndexKeySpecsConflict') {
      // Index already exists with different options, skip
      console.log(`Index already exists, skipping: ${JSON.stringify(keys)}`);
    } else {
      throw error;
    }
  }
};

const up = async (db) => {
  // Support Ticket Subjects indexes
  await createIndexSafe(db.SupportTicketSubject.collection, { code: 1 }, { unique: true, sparse: true });
  await createIndexSafe(db.SupportTicketSubject.collection, { is_active: 1, sort_order: 1, name: 1 });

  // Support Ticket Services indexes
  await createIndexSafe(db.SupportTicketService.collection, { code: 1 }, { unique: true, sparse: true });
  await createIndexSafe(db.SupportTicketService.collection, { is_active: 1, sort_order: 1, name: 1 });

  // Support Ticket Statuses indexes
  await createIndexSafe(db.SupportTicketStatus.collection, { code: 1 }, { unique: true, sparse: true });
  await createIndexSafe(db.SupportTicketStatus.collection, { is_active: 1, sort_order: 1, name: 1 });

  // Support Tickets indexes
  await createIndexSafe(db.SupportTicket.collection, { ticket_number: 1 }, { unique: true });
  await createIndexSafe(db.SupportTicket.collection, { school_id: 1, created_at: -1 });
  await createIndexSafe(db.SupportTicket.collection, { school_id: 1, status_id: 1 });
  await createIndexSafe(db.SupportTicket.collection, { subject_id: 1 });
  await createIndexSafe(db.SupportTicket.collection, { service_id: 1 });
  await createIndexSafe(db.SupportTicket.collection, { status_id: 1 });
  await createIndexSafe(db.SupportTicket.collection, { priority: 1 });
  await createIndexSafe(db.SupportTicket.collection, { updated_at: -1 });
  await createIndexSafe(db.SupportTicket.collection, { school_id: 1, updated_at: -1 });
  await createIndexSafe(db.SupportTicket.collection, { assigned_to: 1 });
  await createIndexSafe(db.SupportTicket.collection, { last_reply_at: -1 });

  // Support Ticket Messages indexes
  await createIndexSafe(db.SupportTicketMessage.collection, { ticket_id: 1, created_at: 1 });
  await createIndexSafe(db.SupportTicketMessage.collection, { school_id: 1, ticket_id: 1 });
  await createIndexSafe(db.SupportTicketMessage.collection, { ticket_id: 1, message_type: 1 });
  await createIndexSafe(db.SupportTicketMessage.collection, { sender_id: 1 });

  // Support Ticket Counters for ticket number generation
  await createIndexSafe(db.SupportTicketCounter.collection, { year: 1 }, { unique: true });
};

const down = async (db) => {
  // Drop all indexes except _id
  const collections = [
    tableNames.supportTicketSubjects,
    tableNames.supportTicketServices,
    tableNames.supportTicketStatuses,
    tableNames.supportTickets,
    tableNames.supportTicketMessages,
    tableNames.supportTicketCounters,
  ];

  for (const collName of collections) {
    const indexes = await db[collName].collection.listIndexes().toArray();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        await db[collName].collection.dropIndex(index.name).catch(() => {});
      }
    }
  }
};

module.exports = { up, down };