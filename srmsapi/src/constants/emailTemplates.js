"use strict";

const EmailTemplates = {
  SUPPORT_TICKET_CREATED: "support_ticket_created",
  SUPPORT_TICKET_REPLY: "support_ticket_reply",
  SUPPORT_TICKET_STATUS_CHANGED: "support_ticket_status_changed",
  SUPPORT_TICKET_ASSIGNED: "support_ticket_assigned",
  WELCOME_EMAIL: "welcome_email",
  PASSWORD_RESET: "password_reset",
  FEE_PAYMENT_REMINDER: "fee_payment_reminder",
};

const EmailTemplateNames = Object.values(EmailTemplates);

const isValidEmailTemplate = (templateId) => {
  return EmailTemplateNames.includes(templateId);
};

module.exports = {
  EmailTemplates,
  EmailTemplateNames,
  isValidEmailTemplate,
};