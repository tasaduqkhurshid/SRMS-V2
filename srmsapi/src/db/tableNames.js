"use strict";

// MongoDB collection names used by Mongoose schemas and database migrations.
const tableNames = Object.freeze({
  schools: "schools",
  users: "users",
  academicYears: "academic_years",
  subjects: "subjects",
  students: "students",
  exams: "exams",
  results: "results",
  courses: "courses",
  images: "images",
  marksheetTemplates: "marksheet_templates",
  studentSubjects: "student_subjects",
  courseSubjects: "course_subjects",
  feeTypes: "fee_types",
  feeStructures: "fee_structures",
  studentFeeAccounts: "student_fee_accounts",
  feePayments: "fee_payments",
  feeAuditLogs: "fee_audit_logs",
  gateways: "gateways",
  schoolGateways: "school_gateways",
  migrationHistory: "_migrations",
  gatewayPresetAuditLogs: "gateway_preset_audit_logs",
  supportTicketSubjects: "support_ticket_subjects",
  supportTicketServices: "support_ticket_services",
  supportTicketStatuses: "support_ticket_statuses",
  supportTickets: "support_tickets",
  supportTicketMessages: "support_ticket_messages",
  supportTicketCounters: "support_ticket_counters",
});

module.exports = tableNames;
