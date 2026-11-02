"use strict";

const DEFAULT_SUBJECTS = [
  { name: "New Service Request", code: "new_service_request", description: "Request for new services or features", sort_order: 1 },
  { name: "Payment Gateway Issue", code: "payment_gateway_issue", description: "Issues related to payment gateway integration or transactions", sort_order: 2 },
  { name: "Technical Support", code: "technical_support", description: "General technical support and troubleshooting", sort_order: 3 },
  { name: "Account Related Issue", code: "account_issue", description: "Account access, login, or profile related issues", sort_order: 4 },
  { name: "Student Module Issue", code: "student_module_issue", description: "Issues with student management module", sort_order: 5 },
  { name: "Examination Module Issue", code: "examination_module_issue", description: "Issues with examination and grading module", sort_order: 6 },
  { name: "Result Management Issue", code: "result_management_issue", description: "Issues with result generation and management", sort_order: 7 },
  { name: "Attendance Module Issue", code: "attendance_module_issue", description: "Issues with attendance tracking module", sort_order: 8 },
  { name: "Data Import / Export", code: "data_import_export", description: "Issues with data import or export functionality", sort_order: 9 },
  { name: "Branding / Logo Issue", code: "branding_issue", description: "Issues with school branding, logos, or themes", sort_order: 10 },
  { name: "Bug Report", code: "bug_report", description: "Report a software bug or unexpected behavior", sort_order: 11 },
  { name: "Feature Request", code: "feature_request", description: "Request for new features or enhancements", sort_order: 12 },
  { name: "Other", code: "other", description: "Other issues not covered by the above categories", sort_order: 13 },
];

const DEFAULT_SERVICES = [
  { name: "Payment Gateway", code: "payment_gateway", description: "Payment gateway integration and configuration", sort_order: 1 },
  { name: "SMS Integration", code: "sms_integration", description: "SMS gateway and messaging integration", sort_order: 2 },
  { name: "WhatsApp Integration", code: "whatsapp_integration", description: "WhatsApp Business API integration", sort_order: 3 },
  { name: "Cloud Storage", code: "cloud_storage", description: "Cloud storage configuration and management", sort_order: 4 },
  { name: "Domain & Hosting", code: "domain_hosting", description: "Domain registration and hosting services", sort_order: 5 },
  { name: "Software Configuration", code: "software_configuration", description: "Software setup and configuration services", sort_order: 6 },
  { name: "Custom Development", code: "custom_development", description: "Custom software development requests", sort_order: 7 },
  { name: "Other Services", code: "other_services", description: "Other services not listed above", sort_order: 8 },
];

const DEFAULT_STATUSES = [
  { name: "Pending", code: "pending", description: "Newly created ticket awaiting action", color: "#F59E0B", is_terminal: false, sort_order: 1, is_system: true },
  { name: "Awaiting", code: "awaiting", description: "Waiting for information or response", color: "#3B82F6", is_terminal: false, sort_order: 2, is_system: true },
  { name: "Underwriting", code: "underwriting", description: "Ticket under review or investigation", color: "#8B5CF6", is_terminal: false, sort_order: 3, is_system: true },
  { name: "Resolved", code: "resolved", description: "Issue resolved or request completed", color: "#10B981", is_terminal: true, sort_order: 4, is_system: true },
];

const seedSupportTicketDefaults = async (db) => {
  // Seed Subjects
  for (const subject of DEFAULT_SUBJECTS) {
    await db.SupportTicketSubject.findOneAndUpdate(
      { code: subject.code },
      { $setOnInsert: { ...subject, is_active: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Seed Services
  for (const service of DEFAULT_SERVICES) {
    await db.SupportTicketService.findOneAndUpdate(
      { code: service.code },
      { $setOnInsert: { ...service, is_active: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Seed Statuses
  for (const status of DEFAULT_STATUSES) {
    await db.SupportTicketStatus.findOneAndUpdate(
      { code: status.code },
      { $setOnInsert: { ...status, is_active: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log("Support ticket defaults seeded successfully");
};

module.exports = { seedSupportTicketDefaults };