"use strict";

const emailTemplates = [
  {
    id: "support_ticket_created",
    name: "Support Ticket Created",
    description: "Sent when a new support ticket is created",
    entities: {
      ticket: "SupportTicket",
      recipient: "User",
      school: "School",
    },
    subject: "New Support Ticket: {{ticket.ticket_number}} - {{ticket.title}}",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Support Ticket</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
    <p style="margin-top: 0;">Hello {{recipient.name || 'Team'}},</p>
    <p>A new support ticket has been created and requires your attention.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #333; font-size: 18px;">{{ticket.title}}</h2>
      <p style="margin: 10px 0;"><strong>Ticket Number:</strong> {{ticket.ticket_number}}</p>
      <p style="margin: 10px 0;"><strong>Priority:</strong> <span style="text-transform: capitalize;">{{ticket.priority}}</span></p>
      <p style="margin: 10px 0;"><strong>Subject:</strong> {{ticket.subject?.name || 'N/A'}}</p>
      <p style="margin: 10px 0;"><strong>Service:</strong> {{ticket.service?.name || 'N/A'}}</p>
      <p style="margin: 10px 0;"><strong>Module:</strong> {{ticket.module || 'N/A'}}</p>
      <p style="margin: 10px 0;"><strong>Description:</strong></p>
      <p style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 4px;">{{ticket.description}}</p>
    </div>
    
    {{#if portalUrl}}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{portalUrl}}/support/tickets/{{ticket._id}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Ticket</a>
    </div>
    {{/if}}
    
    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
    <p style="color: #6c757d; font-size: 12px; margin: 0;">
      This is an automated notification from SRMS Support System. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
    `,
    text: `
New Support Ticket Created

Hello {{recipient.name || 'Team'}},

A new support ticket has been created and requires your attention.

Ticket Number: {{ticket.ticket_number}}
Title: {{ticket.title}}
Priority: {{ticket.priority}}
Subject: {{ticket.subject?.name || 'N/A'}}
Service: {{ticket.service?.name || 'N/A'}}
Module: {{ticket.module || 'N/A'}}
Description: {{ticket.description}}

{{#if portalUrl}}
View Ticket: {{portalUrl}}/support/tickets/{{ticket._id}}
{{/if}}

---
This is an automated notification from SRMS Support System.
    `,
  },
  {
    id: "support_ticket_reply",
    name: "Support Ticket Reply",
    description: "Sent when a reply is added to a support ticket",
    entities: {
      ticket: "SupportTicket",
      reply: "SupportTicketMessage",
      sender: "User",
      recipient: "User",
      school: "School",
    },
    subject: "Reply on Support Ticket: {{ticket.ticket_number}} - {{ticket.title}}",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Reply on Support Ticket</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
    <p style="margin-top: 0;">Hello {{recipient.name || 'Team'}},</p>
    <p>A new reply has been added to a support ticket you're following.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #333; font-size: 18px;">{{ticket.title}}</h2>
      <p style="margin: 10px 0;"><strong>Ticket Number:</strong> {{ticket.ticket_number}}</p>
      <p style="margin: 10px 0;"><strong>From:</strong> {{sender.name}}</p>
      <p style="margin: 10px 0;"><strong>Role:</strong> {{sender.role}}</p>
      <p style="margin: 10px 0;"><strong>Message:</strong></p>
      <p style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 4px;">{{reply.message}}</p>
    </div>
    
    {{#if portalUrl}}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{portalUrl}}/support/tickets/{{ticket._id}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Ticket</a>
    </div>
    {{/if}}
    
    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
    <p style="color: #6c757d; font-size: 12px; margin: 0;">
      This is an automated notification from SRMS Support System. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
    `,
    text: `
New Reply on Support Ticket

Hello {{recipient.name || 'Team'}},

A new reply has been added to a support ticket you're following.

Ticket Number: {{ticket.ticket_number}}
Title: {{ticket.title}}
From: {{sender.name}}
Role: {{sender.role}}
Message: {{reply.message}}

{{#if portalUrl}}
View Ticket: {{portalUrl}}/support/tickets/{{ticket._id}}
{{/if}}

---
This is an automated notification from SRMS Support System.
    `,
  },
  {
    id: "support_ticket_status_changed",
    name: "Support Ticket Status Changed",
    description: "Sent when a support ticket status is changed",
    entities: {
      ticket: "SupportTicket",
      oldStatus: "SupportTicketStatus",
      newStatus: "SupportTicketStatus",
      changedBy: "User",
      recipient: "User",
      school: "School",
    },
    subject: "Status Updated: {{ticket.ticket_number}} - {{ticket.title}}",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Ticket Status Updated</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
    <p style="margin-top: 0;">Hello {{recipient.name || 'Team'}},</p>
    <p>The status of a support ticket has been updated.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #333; font-size: 18px;">{{ticket.title}}</h2>
      <p style="margin: 10px 0;"><strong>Ticket Number:</strong> {{ticket.ticket_number}}</p>
      <p style="margin: 10px 0;"><strong>Previous Status:</strong> <span style="text-transform: capitalize;">{{oldStatus.name}}</span></p>
      <p style="margin: 10px 0;"><strong>New Status:</strong> <span style="text-transform: capitalize;">{{newStatus.name}}</span></p>
      <p style="margin: 10px 0;"><strong>Changed By:</strong> {{changedBy.name}}</p>
    </div>
    
    {{#if portalUrl}}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{portalUrl}}/support/tickets/{{ticket._id}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Ticket</a>
    </div>
    {{/if}}
    
    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
    <p style="color: #6c757d; font-size: 12px; margin: 0;">
      This is an automated notification from SRMS Support System. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
    `,
    text: `
Ticket Status Updated

Hello {{recipient.name || 'Team'}},

The status of a support ticket has been updated.

Ticket Number: {{ticket.ticket_number}}
Title: {{ticket.title}}
Previous Status: {{oldStatus.name}}
New Status: {{newStatus.name}}
Changed By: {{changedBy.name}}

{{#if portalUrl}}
View Ticket: {{portalUrl}}/support/tickets/{{ticket._id}}
{{/if}}

---
This is an automated notification from SRMS Support System.
    `,
  },
  {
    id: "support_ticket_assigned",
    name: "Support Ticket Assigned",
    description: "Sent when a support ticket is assigned to a user",
    entities: {
      ticket: "SupportTicket",
      assignedTo: "User",
      assignedBy: "User",
      recipient: "User",
      school: "School",
    },
    subject: "Ticket Assigned: {{ticket.ticket_number}} - {{ticket.title}}",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Ticket Assigned</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
    <p style="margin-top: 0;">Hello {{recipient.name || 'Team'}},</p>
    <p>A support ticket has been assigned to you.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #333; font-size: 18px;">{{ticket.title}}</h2>
      <p style="margin: 10px 0;"><strong>Ticket Number:</strong> {{ticket.ticket_number}}</p>
      <p style="margin: 10px 0;"><strong>Assigned By:</strong> {{assignedBy.name}}</p>
      <p style="margin: 10px 0;"><strong>Priority:</strong> <span style="text-transform: capitalize;">{{ticket.priority}}</span></p>
    </div>
    
    {{#if portalUrl}}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{portalUrl}}/support/tickets/{{ticket._id}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Ticket</a>
    </div>
    {{/if}}
    
    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
    <p style="color: #6c757d; font-size: 12px; margin: 0;">
      This is an automated notification from SRMS Support System. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
    `,
    text: `
Ticket Assigned

Hello {{recipient.name || 'Team'}},

A support ticket has been assigned to you.

Ticket Number: {{ticket.ticket_number}}
Title: {{ticket.title}}
Assigned By: {{assignedBy.name}}
Priority: {{ticket.priority}}

{{#if portalUrl}}
View Ticket: {{portalUrl}}/support/tickets/{{ticket._id}}
{{/if}}

---
This is an automated notification from SRMS Support System.
    `,
  },
  {
    id: "welcome_email",
    name: "Welcome Email",
    description: "Sent when a new user account is created",
    entities: {
      user: "User",
      school: "School",
      loginUrl: "string",
      temporaryPassword: "string",
    },
    subject: "Welcome to {{school.school_name || school.name}} - Your Account Details",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to {{school.school_name || school.name}}!</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
    <p style="margin-top: 0;">Hello {{user.username}},</p>
    <p>Your account has been created successfully. Here are your login details:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>Username:</strong> {{user.username}}</p>
      <p style="margin: 10px 0;"><strong>Email:</strong> {{user.email}}</p>
      <p style="margin: 10px 0;"><strong>Role:</strong> {{user.role}}</p>
      {{#if temporaryPassword}}
      <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code>{{temporaryPassword}}</code></p>
      <p style="color: #dc3545; font-size: 14px;">Please change your password after first login.</p>
      {{/if}}
    </div>
    
    {{#if loginUrl}}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{loginUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Login to Portal</a>
    </div>
    {{/if}}
    
    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
    <p style="color: #6c757d; font-size: 12px; margin: 0;">
      This is an automated notification from SRMS. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
    `,
    text: `
Welcome to {{school.school_name || school.name}}!

Hello {{user.username}},

Your account has been created successfully. Here are your login details:

Username: {{user.username}}
Email: {{user.email}}
Role: {{user.role}}
{{#if temporaryPassword}}
Temporary Password: {{temporaryPassword}}
Please change your password after first login.
{{/if}}

{{#if loginUrl}}
Login to Portal: {{loginUrl}}
{{/if}}

---
This is an automated notification from SRMS.
    `,
  },
  {
    id: "password_reset",
    name: "Password Reset",
    description: "Sent when a user requests a password reset",
    entities: {
      user: "User",
      resetUrl: "string",
      expiresIn: "string",
    },
    subject: "Password Reset Request - {{user.username}}",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Request</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
    <p style="margin-top: 0;">Hello {{user.username}},</p>
    <p>You requested a password reset for your account. Click the button below to reset your password:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>Username:</strong> {{user.username}}</p>
      <p style="margin: 10px 0;"><strong>Email:</strong> {{user.email}}</p>
      <p style="margin: 10px 0;"><strong>Link expires in:</strong> {{expiresIn}}</p>
    </div>
    
    {{#if resetUrl}}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reset Password</a>
    </div>
    {{/if}}
    
    <p style="color: #dc3545;">If you didn't request this, please ignore this email or contact support.</p>
    
    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
    <p style="color: #6c757d; font-size: 12px; margin: 0;">
      This is an automated notification from SRMS. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
    `,
    text: `
Password Reset Request

Hello {{user.username}},

You requested a password reset for your account.

Username: {{user.username}}
Email: {{user.email}}
Link expires in: {{expiresIn}}

{{#if resetUrl}}
Reset Password: {{resetUrl}}
{{/if}}

If you didn't request this, please ignore this email or contact support.

---
This is an automated notification from SRMS.
    `,
  },
  {
    id: "fee_payment_reminder",
    name: "Fee Payment Reminder",
    description: "Sent as a reminder for upcoming fee payments",
    entities: {
      student: "Student",
      parent: "User",
      school: "School",
      feeStructure: "FeeStructure",
      dueDate: "Date",
      amount: "number",
      portalUrl: "string",
    },
    subject: "Fee Payment Reminder - {{student.name}} - Due {{dueDate}}",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Fee Payment Reminder</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
    <p style="margin-top: 0;">Dear {{parent.name || 'Parent'}},</p>
    <p>This is a reminder that the fee payment for <strong>{{student.name}}</strong> is due soon.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>Student:</strong> {{student.name}} ({{student.admission_number || student.roll_number}})</p>
      <p style="margin: 10px 0;"><strong>Fee Type:</strong> {{feeStructure.name}}</p>
      <p style="margin: 10px 0;"><strong>Amount Due:</strong> {{amount}}</p>
      <p style="margin: 10px 0;"><strong>Due Date:</strong> {{dueDate}}</p>
    </div>
    
    {{#if portalUrl}}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{portalUrl}}/fees" style="background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Pay Now</a>
    </div>
    {{/if}}
    
    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
    <p style="color: #6c757d; font-size: 12px; margin: 0;">
      This is an automated notification from {{school.school_name || school.name}}. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
    `,
    text: `
Fee Payment Reminder

Dear {{parent.name || 'Parent'}},

This is a reminder that the fee payment for {{student.name}} is due soon.

Student: {{student.name}} ({{student.admission_number || student.roll_number}})
Fee Type: {{feeStructure.name}}
Amount Due: {{amount}}
Due Date: {{dueDate}}

{{#if portalUrl}}
Pay Now: {{portalUrl}}/fees
{{/if}}

---
This is an automated notification from {{school.school_name || school.name}}.
    `,
  },
];

const getTemplateById = (id) => {
  return emailTemplates.find((template) => template.id === id);
};

const getAllTemplates = () => {
  return emailTemplates.map(({ id, name, description, entities, subject }) => ({
    id,
    name,
    description,
    entities,
    subject,
  }));
};

module.exports = {
  emailTemplates,
  getTemplateById,
  getAllTemplates,
};