"use strict";

const nodemailer = require("nodemailer");
const { getEmailConfig } = require("../../config/email");
const { getTemplateById } = require("../../config/emailTemplates");
const { EmailTemplates, isValidEmailTemplate } = require("../../constants/emailTemplates");
const logger = require("../../utils/logger");

let transporter = null;
let emailConfig = null;

const initializeTransporter = () => {
  if (transporter) return transporter;
  
  emailConfig = getEmailConfig();
  
  if (!emailConfig.enabled) {
    logger.info("Email service is disabled");
    return null;
  }
  
  const transportOptions = {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
  };
  
  if (emailConfig.auth) {
    transportOptions.auth = emailConfig.auth;
  }
  
  transporter = nodemailer.createTransport(transportOptions);
  
  return transporter;
};

const getTestEmail = () => {
  if (!emailConfig) {
    emailConfig = getEmailConfig();
  }
  return emailConfig.testEmail;
};

const getFromAddress = () => {
  if (!emailConfig) {
    emailConfig = getEmailConfig();
  }
  return `"${emailConfig.from.name}" <${emailConfig.from.email}>`;
};

const resolveRecipientEmail = (intendedEmail) => {
  const testEmail = getTestEmail();
  if (testEmail) {
    logger.info(`Test email mode: redirecting email from ${intendedEmail} to ${testEmail}`);
    return testEmail;
  }
  return intendedEmail;
};

const renderTemplate = (template, data) => {
  let html = template.html;
  let text = template.text;
  let subject = template.subject;
  
  const replacePlaceholders = (str, obj, prefix = "") => {
    if (!str) return str;
    
    return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const keys = path.trim().split(".");
      let value = obj;
      
      for (const key of keys) {
        if (value === null || value === undefined) return "";
        value = value[key];
      }
      
      return value !== undefined && value !== null ? String(value) : "";
    });
  };
  
  const processConditionals = (str, data) => {
    if (!str) return str;
    
    return str.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      const keys = condition.trim().split(".");
      let value = data;
      
      for (const key of keys) {
        if (value === null || value === undefined) return "";
        value = value[key];
      }
      
      return value ? content : "";
    });
  };
  
  html = replacePlaceholders(html, data);
  html = processConditionals(html, data);
  
  text = replacePlaceholders(text, data);
  text = processConditionals(text, data);
  
  subject = replacePlaceholders(subject, data);
  
  return { html, text, subject };
};

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  const transport = initializeTransporter();
  
  if (!transport) {
    logger.warn("Email service not configured, skipping email send");
    return { success: false, reason: "Email service not configured" };
  }
  
  const resolvedTo = resolveRecipientEmail(to);
  const from = getFromAddress();
  
  try {
    const info = await transport.sendMail({
      from,
      to: resolvedTo,
      subject,
      html,
      text,
      attachments,
    });
    
    logger.info(`Email sent successfully to ${resolvedTo}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${resolvedTo}:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendTemplatedEmail = async ({ templateId, to, data, attachments = [] }) => {
  if (!isValidEmailTemplate(templateId)) {
    logger.error(`Invalid email template ID: ${templateId}`);
    return { success: false, error: `Invalid template ID: ${templateId}` };
  }
  
  const template = getTemplateById(templateId);
  
  if (!template) {
    logger.error(`Email template not found: ${templateId}`);
    return { success: false, error: `Template not found: ${templateId}` };
  }
  
  const { html, text, subject } = renderTemplate(template, data);
  
  return sendEmail({ to, subject, html, text, attachments });
};

const sendSupportTicketCreatedEmail = async ({ ticket, recipientEmail, recipientName, portalUrl }) => {
  return sendTemplatedEmail({
    templateId: EmailTemplates.SUPPORT_TICKET_CREATED,
    to: recipientEmail,
    data: {
      ticket,
      recipient: { name: recipientName },
      portalUrl,
    },
  });
};

const sendSupportTicketReplyEmail = async ({ ticket, reply, recipientEmail, recipientName, senderName, portalUrl }) => {
  return sendTemplatedEmail({
    templateId: EmailTemplates.SUPPORT_TICKET_REPLY,
    to: recipientEmail,
    data: {
      ticket,
      reply,
      sender: { name: senderName },
      recipient: { name: recipientName },
      portalUrl,
    },
  });
};

const sendSupportTicketStatusChangedEmail = async ({ ticket, oldStatus, newStatus, changedBy, recipientEmail, recipientName, portalUrl }) => {
  return sendTemplatedEmail({
    templateId: EmailTemplates.SUPPORT_TICKET_STATUS_CHANGED,
    to: recipientEmail,
    data: {
      ticket,
      oldStatus,
      newStatus,
      changedBy,
      recipient: { name: recipientName },
      portalUrl,
    },
  });
};

const sendSupportTicketAssignedEmail = async ({ ticket, assignedTo, assignedBy, recipientEmail, recipientName, portalUrl }) => {
  return sendTemplatedEmail({
    templateId: EmailTemplates.SUPPORT_TICKET_ASSIGNED,
    to: recipientEmail,
    data: {
      ticket,
      assignedTo,
      assignedBy,
      recipient: { name: recipientName },
      portalUrl,
    },
  });
};

const sendWelcomeEmail = async ({ user, school, loginUrl, temporaryPassword, recipientEmail }) => {
  return sendTemplatedEmail({
    templateId: EmailTemplates.WELCOME_EMAIL,
    to: recipientEmail,
    data: {
      user,
      school,
      loginUrl,
      temporaryPassword,
    },
  });
};

const sendPasswordResetEmail = async ({ user, resetUrl, expiresIn, recipientEmail }) => {
  return sendTemplatedEmail({
    templateId: EmailTemplates.PASSWORD_RESET,
    to: recipientEmail,
    data: {
      user,
      resetUrl,
      expiresIn,
    },
  });
};

const sendFeePaymentReminderEmail = async ({ student, parent, school, feeStructure, dueDate, amount, portalUrl, recipientEmail }) => {
  return sendTemplatedEmail({
    templateId: EmailTemplates.FEE_PAYMENT_REMINDER,
    to: recipientEmail,
    data: {
      student,
      parent,
      school,
      feeStructure,
      dueDate,
      amount,
      portalUrl,
    },
  });
};

const verifyConnection = async () => {
  const transport = initializeTransporter();
  
  if (!transport) {
    return { success: false, reason: "Email service not configured" };
  }
  
  try {
    await transport.verify();
    logger.info("Email service connection verified successfully");
    return { success: true };
  } catch (error) {
    logger.error("Email service connection verification failed:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeTransporter,
  sendEmail,
  sendTemplatedEmail,
  renderTemplate,
  sendSupportTicketCreatedEmail,
  sendSupportTicketReplyEmail,
  sendSupportTicketStatusChangedEmail,
  sendSupportTicketAssignedEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendFeePaymentReminderEmail,
  verifyConnection,
  getTestEmail,
  EmailTemplates,
  isValidEmailTemplate,
};