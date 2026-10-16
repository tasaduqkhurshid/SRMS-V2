"use strict";

const { ValidationError } = require("../utils/applicationErrors");
const mongoose = require("mongoose");

const asMinor = (value, label = "Amount") => {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new ValidationError(`${label} must be a non-negative integer amount in minor currency units`);
  }
  return number;
};

const accountDue = (account) => Math.max(0,
  Number(account.gross_minor || 0) - Number(account.concession_minor || 0) + Number(account.adjustment_minor || 0) - Number(account.paid_minor || 0));
const accountAvailable = (account) => Math.max(0, accountDue(account) - Number(account.reserved_minor || 0));
const schoolFilter = (schoolId, extra = {}) => ({
  ...extra,
  school_id: typeof schoolId === "string" && mongoose.Types.ObjectId.isValid(schoolId)
    ? new mongoose.Types.ObjectId(schoolId)
    : schoolId,
});

// Apply credits/adjustments to the latest installment first, keeping the account
// balance and installment balances in sync without rewriting the original schedule.
const effectiveInstallments = (account) => {
  const installments = [...(account.installments || [])]
    .map((item) => typeof item.toObject === "function" ? item.toObject() : item)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .map((item) => ({ ...item, effective_amount_minor: Number(item.amount_minor || 0) }));
  let adjustment = Number(account.adjustment_minor || 0) - Number(account.concession_minor || 0);
  if (adjustment > 0 && installments.length) {
    installments[installments.length - 1].effective_amount_minor += adjustment;
  } else if (adjustment < 0) {
    adjustment = Math.abs(adjustment);
    for (let i = installments.length - 1; i >= 0 && adjustment > 0; i -= 1) {
      const reduction = Math.min(installments[i].effective_amount_minor, adjustment);
      installments[i].effective_amount_minor -= reduction;
      adjustment -= reduction;
    }
  }
  return installments.map((item) => ({
    ...item,
    balance_minor: Math.max(0, item.effective_amount_minor - Number(item.paid_minor || 0)),
  }));
};

module.exports = { asMinor, accountDue, accountAvailable, schoolFilter, effectiveInstallments };
