"use strict";

const up = async (db) => {
  await db.FeeType.collection.createIndex({ school_id: 1, code: 1 }, { unique: true, name: 'unique_school_fee_type_code' });
  await db.FeeType.collection.createIndex({ school_id: 1, name: 1 }, { unique: true, name: 'unique_school_fee_type_name' });
  await db.FeeStructure.collection.createIndex({ school_id: 1, academic_year_id: 1, course_id: 1, name: 1 }, { unique: true, name: 'unique_school_fee_structure_scope_name' });
  await db.StudentFeeAccount.collection.createIndex({ school_id: 1, student_id: 1, academic_year_id: 1, fee_structure_id: 1 }, { unique: true, name: 'unique_school_student_fee_assignment' });
  await db.StudentFeeAccount.collection.createIndex({ school_id: 1, course_id: 1, academic_year_id: 1, status: 1 }, { name: 'school_fee_account_report_scope' });
  await db.FeePayment.collection.createIndex({ school_id: 1, account_id: 1 }, { unique: true, partialFilterExpression: { status: 'PENDING', method: 'ONLINE' }, name: 'one_pending_online_payment_per_account' });
  await db.FeePayment.collection.createIndex({ school_id: 1, idempotency_key: 1 }, { unique: true, name: 'unique_school_fee_payment_idempotency' });
  await db.FeePayment.collection.createIndex({ school_id: 1, receipt_number: 1 }, { unique: true, partialFilterExpression: { receipt_number: { $type: 'string' } }, name: 'unique_school_fee_receipt' });
  await db.FeePayment.collection.createIndex({ school_id: 1, provider_payment_id: 1 }, { unique: true, partialFilterExpression: { provider_payment_id: { $type: 'string' } }, name: 'unique_school_provider_payment' });
  await db.FeePayment.collection.createIndex({ school_id: 1, provider_refund_id: 1 }, { unique: true, partialFilterExpression: { provider_refund_id: { $type: 'string' } }, name: 'unique_school_provider_refund' });
  await db.FeePayment.collection.createIndex({ school_id: 1, student_id: 1, createdAt: -1 }, { name: 'school_student_fee_history' });
  await db.FeeAudit.collection.createIndex({ school_id: 1, entity_type: 1, entity_id: 1, createdAt: -1 }, { name: 'school_fee_audit_history' });
};

module.exports = { up };
