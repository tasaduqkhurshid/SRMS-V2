"use strict";

const replaceOptionalUniqueIndex = async (collection, keys, field, name) => {
  const indexes = await collection.listIndexes().toArray();
  if (indexes.some((index) => index.name === name)) await collection.dropIndex(name);
  await collection.createIndex(keys, {
    unique: true,
    partialFilterExpression: { [field]: { $type: "string" } },
    name,
  });
};

const up = async (db) => {
  const payments = db.FeePayment.collection;
  await replaceOptionalUniqueIndex(payments, { school_id: 1, receipt_number: 1 }, "receipt_number", "unique_school_fee_receipt");
  await replaceOptionalUniqueIndex(payments, { school_id: 1, provider_payment_id: 1 }, "provider_payment_id", "unique_school_provider_payment");
  await replaceOptionalUniqueIndex(payments, { school_id: 1, provider_refund_id: 1 }, "provider_refund_id", "unique_school_provider_refund");
};

module.exports = { up };
