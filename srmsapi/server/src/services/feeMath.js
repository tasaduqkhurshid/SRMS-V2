"use strict";

const { ValidationError, ConflictError } = require("../utils/applicationErrors");
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
const allocateToInstallment = (account, installmentId, amountMinor) => {
  const scheduled = effectiveInstallments(account).find((item) => String(item._id) === String(installmentId));
  const installment = account.installments.id(installmentId);
  if (!scheduled || !installment) throw new ValidationError("Choose a valid installment for this collection");
  if (amountMinor > scheduled.balance_minor) throw new ValidationError("Collection cannot exceed this month's outstanding installment balance");
  installment.paid_minor += amountMinor;
};
const reverseCollectionAllocation = (account, originalPayment, amountMinor) => {
  if (originalPayment.installment_id) {
    const installment = account.installments.id(originalPayment.installment_id);
    if (!installment || installment.paid_minor < amountMinor) throw new ConflictError("Refund cannot be reversed from the original month's installment balance");
    installment.paid_minor -= amountMinor;
    return;
  }
  let remaining = amountMinor;
  for (const installment of [...account.installments].sort((a, b) => new Date(b.due_date) - new Date(a.due_date))) {
    const take = Math.min(installment.paid_minor, remaining);
    installment.paid_minor -= take;
    remaining -= take;
    if (!remaining) break;
  }
  if (remaining) throw new ConflictError("Refund exceeds the installments with recorded payments");
};
const synchronizeAccountStructure = (account, structure) => {
  const oldLines = new Map((account.lines || []).map((line) => [String(line.fee_type_id), line]));
  const previouslyIncluded = new Set(oldLines.keys());
  const selected = (structure.lines || []).filter((line) => line.required !== false || previouslyIncluded.has(String(line.fee_type_id)))
    .map((line) => {
      const previous = oldLines.get(String(line.fee_type_id));
      const concession = Math.min(Number(previous?.concession_minor || 0), Number(line.amount_minor || 0));
      return { fee_type_id: line.fee_type_id, name: line.name, billing_period: line.billing_period === "ANNUAL" ? "ANNUAL" : "MONTHLY", amount_minor: Number(line.amount_minor || 0), concession_minor: concession, required: line.required !== false };
    });
  const installments = (account.installments || []).map((item) => typeof item.toObject === "function" ? item.toObject() : { ...item });
  const frozen = new Set(installments.map((item, index) => Number(item.paid_minor || 0) > 0 ? index : -1).filter((index) => index >= 0));
  const annualLocation = new Map();
  installments.forEach((item, index) => (item.lines || []).forEach((line) => {
    if (line.billing_period === "ANNUAL" && line.fee_type_id) annualLocation.set(String(line.fee_type_id), { index, line });
  }));
  const annualTargets = new Map();
  for (const line of selected.filter((item) => item.billing_period === "ANNUAL")) {
    const previous = annualLocation.get(String(line.fee_type_id));
    if (previous && frozen.has(previous.index)) {
      const gross = Number(previous.line.gross_amount_minor ?? oldLines.get(String(line.fee_type_id))?.amount_minor ?? line.amount_minor);
      line.amount_minor = gross;
      line.concession_minor = Math.min(Number(previous.line.concession_minor ?? oldLines.get(String(line.fee_type_id))?.concession_minor ?? line.concession_minor), gross);
    } else if (previous) annualTargets.set(String(line.fee_type_id), previous.index);
    else {
      const targetIndex = installments.findIndex((_item, index) => !frozen.has(index));
      if (targetIndex >= 0) annualTargets.set(String(line.fee_type_id), targetIndex);
    }
  }
  for (let index = selected.length - 1; index >= 0; index -= 1) {
    const line = selected[index];
    if (line.billing_period === "ANNUAL" && !annualTargets.has(String(line.fee_type_id)) && !annualLocation.has(String(line.fee_type_id))) selected.splice(index, 1);
  }
  const monthlyLines = selected.filter((line) => line.billing_period !== "ANNUAL");
  const accountLines = new Map(selected.map((line) => [String(line.fee_type_id), line]));
  let grossMinor = 0;
  let scheduledConcessionMinor = 0;
  installments.forEach((item, index) => {
    if (!frozen.has(index)) {
      const dueLines = [...monthlyLines, ...selected.filter((line) => line.billing_period === "ANNUAL" && annualTargets.get(String(line.fee_type_id)) === index)];
      item.lines = dueLines.map((line) => ({
        fee_type_id: line.fee_type_id, name: line.name, billing_period: line.billing_period,
        gross_amount_minor: line.amount_minor, concession_minor: line.concession_minor,
        amount_minor: line.amount_minor - line.concession_minor,
      }));
      item.amount_minor = item.lines.reduce((sum, line) => sum + line.amount_minor, 0);
      if (structure.due_day) {
        const dueDate = new Date(item.due_date);
        const day = Math.min(Number(structure.due_day), new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate());
        dueDate.setDate(day); dueDate.setHours(23, 59, 59, 999); item.due_date = dueDate;
      }
    }
    for (const line of item.lines || []) {
      const gross = Number(line.gross_amount_minor ?? line.amount_minor ?? 0);
      const concession = Number(line.concession_minor || 0);
      grossMinor += gross;
      scheduledConcessionMinor += concession;
      if (!accountLines.has(String(line.fee_type_id)) && line.fee_type_id) {
        const previous = oldLines.get(String(line.fee_type_id));
        accountLines.set(String(line.fee_type_id), { fee_type_id: line.fee_type_id, name: line.name || previous?.name || "Fee", billing_period: line.billing_period || previous?.billing_period || "MONTHLY", amount_minor: gross, concession_minor: concession });
      }
    }
  });
  const oldScheduledConcession = Number(account.scheduled_concession_minor ?? ((account.monthly_concession_minor || 0) * (account.months_remaining || 0) + (account.annual_concession_minor || 0)));
  const unscheduledConcession = Math.max(0, Number(account.concession_minor || 0) - oldScheduledConcession);
  const monthlyTotal = monthlyLines.reduce((sum, line) => sum + line.amount_minor, 0);
  const monthlyConcession = monthlyLines.reduce((sum, line) => sum + line.concession_minor, 0);
  const annualTotal = installments.reduce((sum, item) => sum + (item.lines || []).filter((line) => line.billing_period === "ANNUAL").reduce((lineSum, line) => lineSum + Number(line.gross_amount_minor ?? line.amount_minor ?? 0), 0), 0);
  const annualConcession = installments.reduce((sum, item) => sum + (item.lines || []).filter((line) => line.billing_period === "ANNUAL").reduce((lineSum, line) => lineSum + Number(line.concession_minor || 0), 0), 0);
  return {
    structure_name: structure.name,
    lines: [...accountLines.values()].map(({ fee_type_id, name, billing_period, amount_minor, concession_minor }) => ({ fee_type_id, name, billing_period, amount_minor, concession_minor })),
    installments,
    due_day: structure.due_day || account.due_day || 10,
    monthly_total_minor: monthlyTotal,
    monthly_concession_minor: monthlyConcession,
    annual_total_minor: annualTotal,
    annual_concession_minor: annualConcession,
    gross_minor: grossMinor,
    scheduled_concession_minor: scheduledConcessionMinor,
    concession_minor: scheduledConcessionMinor + unscheduledConcession,
  };
};
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
  const scheduledConcession = Math.min(Number(account.concession_minor || 0), Number(account.scheduled_concession_minor || 0));
  let adjustment = Number(account.adjustment_minor || 0) - (Number(account.concession_minor || 0) - scheduledConcession);
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

module.exports = { asMinor, accountDue, accountAvailable, schoolFilter, effectiveInstallments, allocateToInstallment, reverseCollectionAllocation, synchronizeAccountStructure };
