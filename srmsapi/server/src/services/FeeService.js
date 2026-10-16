"use strict";

const crypto = require("node:crypto");
const PaymentProvider = require("./payment/PaymentProvider");
const {
  FeeType, FeeStructure, StudentFeeAccount, FeePayment, FeeAudit,
  Student, Course, AcademicYear, School, User, mongoose,
} = require("../db/models");
const { ValidationError, NotFoundError, ConflictError, AuthorizationError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");
const { asMinor, accountDue, accountAvailable, schoolFilter, effectiveInstallments } = require("./feeMath");
const { assertPortalStudentAccess } = require("./feeAuthorization");
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const requestIdempotencyKey = (payload = {}) => {
  const key = String(payload.idempotency_key || "").trim();
  if (!key || key.length > 160) throw new ValidationError("A valid idempotency key is required");
  return key;
};
const dateRangeFilter = (from, to, label = "Date range") => {
  if (!from && !to) return null;
  const range = {};
  if (from) {
    range.$gte = new Date(from);
    if (Number.isNaN(range.$gte.getTime())) throw new ValidationError(`${label} start date is invalid`);
  }
  if (to) {
    range.$lte = new Date(to);
    if (Number.isNaN(range.$lte.getTime())) throw new ValidationError(`${label} end date is invalid`);
    range.$lte.setHours(23, 59, 59, 999);
  }
  if (range.$gte && range.$lte && range.$gte > range.$lte) throw new ValidationError(`${label} start date must be before the end date`);
  return range;
};
const sessionWork = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => { result = await work(session); });
    return result;
  } finally { await session.endSession(); }
};
const audit = (schoolId, actorId, action, entityType, entityId, details = {}, session = null) =>
  FeeAudit.create([{ school_id: schoolId, actor_id: actorId, action, entity_type: entityType, entity_id: entityId, details }], session ? { session } : {});
const ensureOwned = async (Model, id, schoolId, resource, session = null) => {
  const query = Model.findOne(schoolFilter(schoolId, { _id: id }));
  if (session) query.session(session);
  const value = await query;
  if (!value) throw new NotFoundError(resource);
  return value;
};
const parsePage = (page, limit) => ({ page: Math.max(1, Number(page) || 1), limit: Math.min(100, Math.max(1, Number(limit) || 20)) });
const cleanAccount = (account) => {
  const value = typeof account.toObject === "function" ? account.toObject() : account;
  return { ...value, balance_minor: accountDue(value) };
};
const portalPayment = (payment) => ({
  _id: payment._id, amount_minor: payment.amount_minor, kind: payment.kind, method: payment.method,
  status: payment.status, reference: payment.method === "ONLINE" ? "" : payment.reference, receipt_number: payment.receipt_number,
  confirmed_at: payment.confirmed_at, createdAt: payment.createdAt,
  status_message: payment.status === "PENDING" && payment.provider_failed_payment_ids?.length
    ? "A payment attempt failed. Retry checkout or check the order status."
    : "",
});
const portalAccount = (account) => ({
  _id: account._id, structure_name: account.structure_name, academic_year_id: account.academic_year_id,
  lines: account.lines, installments: account.installments, gross_minor: account.gross_minor,
  concession_minor: account.concession_minor, adjustment_minor: account.adjustment_minor,
  paid_minor: account.paid_minor, balance_minor: account.balance_minor, status: account.status,
});
const allocateToInstallments = (account, amountMinor) => {
  let remaining = amountMinor;
  for (const scheduled of effectiveInstallments(account)) {
    const installment = account.installments.id(scheduled._id);
    if (!installment) continue;
    const applied = Math.min(scheduled.balance_minor, remaining);
    installment.paid_minor += applied;
    remaining -= applied;
    if (!remaining) break;
  }
  if (remaining > 0) throw new ConflictError("Payment could not be allocated to the remaining installments");
};

const listFeeTypes = async (schoolId) => {
  const types = await FeeType.find(schoolFilter(schoolId)).sort({ name: 1 }).lean();
  return types;
};
const saveFeeType = async (schoolId, actorId, payload = {}, id = null) => {
  const name = String(payload.name || "").trim();
  const code = String(payload.code || "").trim().toUpperCase();
  if (!name || !code) throw new ValidationError("Fee type name and code are required");
  const fields = { name, code, description: String(payload.description || "").trim(), active: payload.active !== false };
  if (id && fields.active === false) {
    const usedByActiveStructure = await FeeStructure.exists(schoolFilter(schoolId, { active: true, "lines.fee_type_id": id }));
    if (usedByActiveStructure) throw new ValidationError("Deactivate structures using this fee type before deactivating the type");
  }
  const row = id
    ? await FeeType.findOneAndUpdate(schoolFilter(schoolId, { _id: id }), { $set: fields }, { new: true, runValidators: true })
    : await FeeType.create({ ...fields, school_id: schoolId });
  if (!row) throw new NotFoundError("Fee type");
  await audit(schoolId, actorId, id ? "FEE_TYPE_UPDATED" : "FEE_TYPE_CREATED", "FeeType", row._id, { code });
  return row.toObject();
};

const listStructures = async (schoolId, filters = {}) => {
  const where = schoolFilter(schoolId);
  if (filters.course_id) where.course_id = filters.course_id;
  if (filters.academic_year_id) where.academic_year_id = filters.academic_year_id;
  if (filters.active !== undefined) where.active = String(filters.active) !== "false";
  const rows = await FeeStructure.find(where)
    .populate("course_id", "course_name course_code")
    .populate("academic_year_id", "name start_date end_date")
    .sort({ createdAt: -1 }).lean();
  return rows;
};
const saveStructure = async (schoolId, actorId, payload = {}, id = null) => {
  const name = String(payload.name || "").trim();
  if (!name || !payload.course_id || !payload.academic_year_id) throw new ValidationError("Name, class/course and academic year are required");
  const [course, year] = await Promise.all([
    Course.findOne(schoolFilter(schoolId, { _id: payload.course_id })).lean(),
    AcademicYear.findOne(schoolFilter(schoolId, { _id: payload.academic_year_id })).lean(),
  ]);
  if (!course || !year) throw new ValidationError("The selected course and academic year must belong to this school");
  const inputLines = Array.isArray(payload.lines) ? payload.lines : [];
  if (!inputLines.length) throw new ValidationError("At least one fee line is required");
  const typeIds = [...new Set(inputLines.map((line) => String(line.fee_type_id || "")))];
  const types = await FeeType.find(schoolFilter(schoolId, { _id: { $in: typeIds }, active: true })).lean();
  if (types.length !== typeIds.length) throw new ValidationError("Every fee line must use an active fee type from this school");
  const typeMap = new Map(types.map((type) => [String(type._id), type]));
  const lines = inputLines.map((line) => {
    const type = typeMap.get(String(line.fee_type_id));
    return { fee_type_id: type._id, name: type.name, amount_minor: asMinor(line.amount_minor, `${type.name} amount`) };
  });
  if (lines.some((line) => line.amount_minor < 1)) throw new ValidationError("Fee line amounts must be greater than zero");
  const totalMinor = lines.reduce((sum, line) => sum + line.amount_minor, 0);
  if (!Number.isSafeInteger(totalMinor)) throw new ValidationError("Fee structure total exceeds the supported amount");
  let installments = Array.isArray(payload.installments) ? payload.installments.map((item) => ({
    name: String(item.name || "").trim(),
    due_date: new Date(item.due_date),
    amount_minor: asMinor(item.amount_minor, "Installment amount"),
  })) : [];
  if (installments.some((item) => !item.name || Number.isNaN(item.due_date.getTime()) || item.amount_minor < 1)) {
    throw new ValidationError("Each installment needs a name, valid due date, and amount greater than zero");
  }
  if (installments.length && installments.reduce((sum, item) => sum + item.amount_minor, 0) !== totalMinor) {
    throw new ValidationError("Installment amounts must add up to the fee structure total");
  }
  const fields = {
    name, course_id: course._id, academic_year_id: year._id, lines, installments,
    total_minor: totalMinor, active: payload.active !== false, updated_by: actorId,
  };
  if (!id) fields.created_by = actorId;
  const row = id
    ? await FeeStructure.findOneAndUpdate(schoolFilter(schoolId, { _id: id }), { $set: fields }, { new: true, runValidators: true })
    : await FeeStructure.create({ ...fields, school_id: schoolId });
  if (!row) throw new NotFoundError("Fee structure");
  await audit(schoolId, actorId, id ? "FEE_STRUCTURE_UPDATED" : "FEE_STRUCTURE_CREATED", "FeeStructure", row._id, { total_minor: totalMinor });
  return row.toObject();
};

const assignStructure = async (schoolId, actorId, payload = {}) => {
  const structure = await FeeStructure.findOne(schoolFilter(schoolId, { _id: payload.fee_structure_id, active: true })).lean();
  if (!structure) throw new NotFoundError("Active fee structure");
  const course = await Course.findOne(schoolFilter(schoolId, { _id: structure.course_id })).select("course_name course_code").lean();
  if (!course) throw new ValidationError("The fee structure's course no longer exists in this school");
  const structureTypeIds = [...new Set(structure.lines.map((line) => String(line.fee_type_id)))];
  const activeTypes = await FeeType.countDocuments(schoolFilter(schoolId, { _id: { $in: structureTypeIds }, active: true }));
  if (activeTypes !== structureTypeIds.length) throw new ValidationError("This structure uses an inactive fee type and cannot be assigned until it is updated");
  const courseClasses = [String(structure.course_id), course.course_name, course.course_code].filter(Boolean).map(String);
  const studentIds = Array.isArray(payload.student_ids) ? [...new Set(payload.student_ids.map(String))] : [];
  const students = await Student.find(schoolFilter(schoolId, studentIds.length
    ? { _id: { $in: studentIds }, class: { $in: courseClasses } }
    : { class: { $in: courseClasses } })).select("_id class name").lean();
  if (studentIds.length && students.length !== studentIds.length) throw new ValidationError("Some selected students do not belong to this school and course");
  if (!students.length) return { assigned: 0, skipped: 0, accounts: [] };
  const concession = asMinor(payload.concession_minor || 0, "Concession");
  if (concession >= structure.total_minor) throw new ValidationError("Concession must be less than the fee structure total");
  const schedule = structure.installments.length
    ? structure.installments
    : [{ name: "Full payment", due_date: new Date(), amount_minor: structure.total_minor }];
  const accounts = [];
  let skipped = 0;
  for (const student of students) {
    const exists = await StudentFeeAccount.exists(schoolFilter(schoolId, {
      student_id: student._id, academic_year_id: structure.academic_year_id, fee_structure_id: structure._id,
    }));
    if (exists) { skipped += 1; continue; }
    const installments = schedule.map((item) => ({ ...item, paid_minor: 0 }));
    const account = await StudentFeeAccount.create({
      school_id: schoolId, student_id: student._id, course_id: structure.course_id,
      academic_year_id: structure.academic_year_id, fee_structure_id: structure._id,
      structure_name: structure.name, lines: structure.lines.map((line) => ({ ...line })),
      installments,
      gross_minor: structure.total_minor, concession_minor: concession, adjustment_minor: 0,
      paid_minor: 0, assigned_by: actorId,
    });
    accounts.push(cleanAccount(account));
  }
  if (accounts.length) await audit(schoolId, actorId, "STUDENT_FEES_ASSIGNED", "StudentFeeAccount", accounts[0]._id, { count: accounts.length, structure_id: structure._id });
  return { assigned: accounts.length, skipped, accounts };
};

const provisionParentAccess = async (schoolId, actorId, payload = {}) => {
  const username = String(payload.username || "").trim();
  const password = typeof payload.password === "string" ? payload.password : "";
  const studentIds = [...new Set((Array.isArray(payload.student_ids) ? payload.student_ids : []).map(String))];
  if (!username || password.length < 8 || !studentIds.length) throw new ValidationError("Parent username, password of at least 8 characters, and one or more students are required");
  const students = await Student.find(schoolFilter(schoolId, { _id: { $in: studentIds } })).select("_id").lean();
  if (students.length !== studentIds.length) throw new ValidationError("Every linked student must belong to this school");
  if (await User.exists({ username })) throw new ConflictError("That username is already in use");
  const bcrypt = require("bcryptjs");
  const parent = await User.create({
    username, email: String(payload.email || "").trim().toLowerCase(),
    password: await bcrypt.hash(password, 12), role: "PARENT", school_id: schoolId,
    linked_student_ids: students.map((student) => student._id),
  });
  await audit(schoolId, actorId, "PARENT_FEE_ACCESS_CREATED", "User", parent._id, { linked_student_count: students.length });
  return { id: parent._id, username: parent.username, email: parent.email || "", linked_student_count: students.length };
};

const listAccounts = async (schoolId, filters = {}) => {
  const { page, limit } = parsePage(filters.page, filters.limit);
  const where = schoolFilter(schoolId);
  for (const key of ["student_id", "course_id", "academic_year_id", "status"]) if (filters[key]) where[key] = filters[key];
  if (filters.q) {
    const students = await Student.find(schoolFilter(schoolId, { name: { $regex: escapeRegex(String(filters.q).trim()), $options: "i" } })).select("_id").limit(500).lean();
    where.student_id = { $in: students.map((student) => student._id) };
  }
  const accountSortFields = { createdAt: "createdAt", amount: "gross_minor", paid: "paid_minor" };
  const sortField = accountSortFields[filters.sort_by] || "createdAt";
  const sortDirection = String(filters.sort_direction).toLowerCase() === "asc" ? 1 : -1;
  const [rows, total] = await Promise.all([
    StudentFeeAccount.find(where).populate("student_id", "name roll_number admission_number class section")
      .populate("course_id", "course_name course_code").populate("academic_year_id", "name")
      .sort({ [sortField]: sortDirection, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    StudentFeeAccount.countDocuments(where),
  ]);
  const ids = rows.map((row) => row._id);
  const payments = await FeePayment.aggregate([
    { $match: schoolFilter(schoolId, { account_id: { $in: ids }, status: "CONFIRMED" }) },
    { $group: { _id: "$account_id", collected: { $sum: { $cond: [{ $eq: ["$kind", "COLLECTION"] }, "$amount_minor", { $multiply: ["$amount_minor", -1] }] } } } },
  ]);
  const paidByAccount = new Map(payments.map((item) => [String(item._id), item.collected]));
  return { accounts: rows.map((row) => cleanAccount({ ...row, paid_minor: paidByAccount.get(String(row._id)) || row.paid_minor || 0 })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const getAccount = async (schoolId, accountId) => {
  const account = await StudentFeeAccount.findOne(schoolFilter(schoolId, { _id: accountId }))
    .populate("student_id", "name roll_number admission_number class section")
    .populate("course_id", "course_name course_code").populate("academic_year_id", "name").lean();
  if (!account) throw new NotFoundError("Student fee account");
  const payments = await FeePayment.find(schoolFilter(schoolId, { account_id: account._id })).sort({ createdAt: -1 }).lean();
  const paid = payments.filter((payment) => payment.status === "CONFIRMED").reduce((sum, payment) =>
    sum + (payment.kind === "COLLECTION" ? payment.amount_minor : -payment.amount_minor), 0);
  const statement = cleanAccount({ ...account, paid_minor: Math.max(0, paid) });
  return { ...statement, installments: effectiveInstallments(statement), payments };
};

const recordCollection = async (schoolId, actorId, accountId, payload = {}) => {
  const amount = asMinor(payload.amount_minor, "Collection amount");
  if (amount < 1) throw new ValidationError("Collection amount must be greater than zero");
  const method = String(payload.method || "CASH").toUpperCase();
  if (!["CASH", "BANK_TRANSFER", "CHEQUE"].includes(method)) throw new ValidationError("Choose cash, bank transfer, or cheque for manual collection");
  const idempotencyKey = requestIdempotencyKey(payload);
  const receiptNumber = `RC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  return sessionWork(async (session) => {
    const existingPayment = await FeePayment.findOne(schoolFilter(schoolId, { idempotency_key: idempotencyKey })).session(session).lean();
    if (existingPayment) {
      if (String(existingPayment.account_id) !== String(accountId) || existingPayment.amount_minor !== amount || existingPayment.kind !== "COLLECTION") throw new ConflictError("The idempotency key was already used for another transaction");
      const existingAccount = await ensureOwned(StudentFeeAccount, accountId, schoolId, "Student fee account", session);
      return { payment: existingPayment, account: cleanAccount(existingAccount) };
    }
    const account = await ensureOwned(StudentFeeAccount, accountId, schoolId, "Student fee account", session);
    if (account.status !== "ACTIVE") throw new ConflictError("This fee account is closed");
    if (amount > accountAvailable(account)) throw new ValidationError("Collection cannot exceed the available outstanding balance after pending online payments");
    allocateToInstallments(account, amount);
    account.paid_minor += amount;
    await account.save({ session });
    const [payment] = await FeePayment.create([{
      school_id: schoolId, account_id: account._id, student_id: account.student_id,
      amount_minor: amount, kind: "COLLECTION", method, status: "CONFIRMED",
      reference: String(payload.reference || "").trim(), idempotency_key: idempotencyKey,
      receipt_number: receiptNumber, received_by: actorId,
      notes: String(payload.notes || "").trim(), confirmed_at: new Date(),
    }], { session });
    await audit(schoolId, actorId, "FEE_PAYMENT_COLLECTED", "FeePayment", payment._id, { amount_minor: amount, method, account_id: account._id }, session);
    return { payment: payment.toObject(), account: cleanAccount(account) };
  });
};

const initiateOnlinePayment = async (user, accountId, payload = {}) => {
  const schoolId = user?.school_id;
  const amount = asMinor(payload.amount_minor, "Payment amount");
  if (!amount) throw new ValidationError("Payment amount must be greater than zero");
  if (!schoolId) throw new AuthorizationError("A school account is required");
  const school = await School.findById(schoolId).select("status settings.onlinePayments").lean();
  const config = school?.settings?.onlinePayments || {};
  if (!school || school.status !== "active") throw new ValidationError("This school cannot currently accept payments");
  if (!config.enabled || config.provider !== "razorpay" || !PaymentProvider.isConfigured()) throw new ValidationError("Online payments are not available for this school");
  const account = await StudentFeeAccount.findOne(schoolFilter(schoolId, { _id: accountId, status: "ACTIVE" })).lean();
  if (!account) throw new NotFoundError("Student fee account");
  assertPortalStudentAccess(user, account.student_id);
  const idempotencyKey = String(payload.idempotency_key || "").trim();
  if (!idempotencyKey) throw new ValidationError("An idempotency key is required");
  const activePending = await FeePayment.findOne(schoolFilter(schoolId, { account_id: account._id, status: "PENDING", method: "ONLINE" })).lean();
  if (activePending) {
    if (activePending.amount_minor !== amount || !activePending.provider_order_id) throw new ConflictError("An online payment is already in progress for this fee account");
    return { payment_id: activePending._id, order_id: activePending.provider_order_id, key_id: process.env.RAZORPAY_KEY_ID, amount_minor: activePending.amount_minor, currency: "INR", status: activePending.status };
  }
  const due = accountAvailable(account);
  if (!due || amount > due) throw new ValidationError("Payment amount must be within the available outstanding balance");
  const pendingOrder = await sessionWork(async (session) => {
    const duplicate = await FeePayment.findOne(schoolFilter(schoolId, { idempotency_key: idempotencyKey })).session(session);
    if (duplicate) {
      if (String(duplicate.account_id) !== String(account._id) || duplicate.amount_minor !== amount || duplicate.method !== "ONLINE") throw new ConflictError("The idempotency key was already used for another transaction");
      return { payment: duplicate, createOrder: false };
    }
    const current = await ensureOwned(StudentFeeAccount, accountId, schoolId, "Student fee account", session);
    const activePending = await FeePayment.findOne(schoolFilter(schoolId, { account_id: current._id, status: "PENDING", method: "ONLINE" })).session(session);
    if (activePending) {
      if (activePending.amount_minor !== amount || !activePending.provider_order_id) throw new ConflictError("An online payment is already in progress for this fee account");
      return { payment: activePending, createOrder: false };
    }
    if (amount > accountAvailable(current)) throw new ValidationError("Payment amount must be within the available outstanding balance");
    current.reserved_minor = Number(current.reserved_minor || 0) + amount;
    await current.save({ session });
    const [created] = await FeePayment.create([{
      school_id: schoolId, account_id: current._id, student_id: current.student_id,
      amount_minor: amount, kind: "COLLECTION", method: "ONLINE", status: "PENDING",
      idempotency_key: idempotencyKey, notes: "Online payment initiated",
    }], { session });
    return { payment: created, createOrder: true };
  });
  const { payment, createOrder: shouldCreateOrder } = pendingOrder;
  if (payment.provider_order_id) return { payment_id: payment._id, order_id: payment.provider_order_id, key_id: process.env.RAZORPAY_KEY_ID, amount_minor: payment.amount_minor, status: payment.status };
  if (!shouldCreateOrder) throw new ConflictError("The online payment order is still being prepared. Retry in a moment.");
  try {
    const order = await PaymentProvider.createOrder({ amountMinor: amount, receipt: payment._id, notes: { fee_payment_id: String(payment._id), school_id: String(schoolId) } });
    payment.provider_order_id = order.id;
    payment.provider_expires_at = order.expire_by ? new Date(Number(order.expire_by) * 1000) : undefined;
    await payment.save();
    return { payment_id: payment._id, order_id: order.id, key_id: order.key_id, amount_minor: amount, currency: "INR", status: "PENDING" };
  } catch (error) {
    await sessionWork(async (session) => {
      const currentPayment = await FeePayment.findOne(schoolFilter(schoolId, { _id: payment._id })).session(session);
      if (!currentPayment || currentPayment.status !== "PENDING") return;
      const currentAccount = await ensureOwned(StudentFeeAccount, currentPayment.account_id, schoolId, "Student fee account", session);
      currentAccount.reserved_minor = Math.max(0, Number(currentAccount.reserved_minor || 0) - currentPayment.amount_minor);
      currentPayment.status = "FAILED";
      currentPayment.notes = "Payment order could not be created";
      await currentAccount.save({ session });
      await currentPayment.save({ session });
    });
    throw error;
  }
};

const handlePaymentWebhook = async (schoolId, rawBody, signature, body = {}) => {
  if (!PaymentProvider.verifyWebhook(rawBody, signature)) throw new AuthorizationError("Invalid payment webhook signature");
  const event = String(body.event || "");
  if (["refund.processed", "refund.failed"].includes(event)) {
    const refundEntity = body.payload?.refund?.entity;
    const refundId = String(refundEntity?.id || "");
    const feeRefundId = String(refundEntity?.notes?.fee_refund_id || "");
    if (!refundEntity || !refundId || !feeRefundId) return { accepted: true, ignored: true };
    return sessionWork(async (session) => {
      const refund = await FeePayment.findOne(schoolFilter(schoolId, { _id: feeRefundId, kind: "REFUND" })).session(session);
      if (!refund) return { accepted: true, ignored: true };
      if (refund.status === "CONFIRMED") return { accepted: true, duplicate: true, status: refund.status };
      if (event === "refund.failed") {
        if (refund.status === "FAILED" && refund.provider_refund_id === refundId) return { accepted: true, duplicate: true, status: refund.status };
        const original = await ensureOwned(FeePayment, refund.related_payment_id, schoolId, "Original fee payment", session);
        original.refund_reserved_minor = Math.max(0, Number(original.refund_reserved_minor || 0) - refund.amount_minor);
        refund.provider_refund_id = refundId;
        refund.status = "FAILED";
        refund.notes = "The provider reported that this refund failed";
        await original.save({ session });
        await refund.save({ session });
        await audit(schoolId, null, "ONLINE_REFUND_FAILED", "FeePayment", refund._id, { provider_refund_id: refundId }, session);
        return { accepted: true, status: refund.status };
      }
      const original = await ensureOwned(FeePayment, refund.related_payment_id, schoolId, "Original fee payment", session);
      if (original.provider_payment_id !== String(refundEntity.payment_id) || Number(refundEntity.amount) !== refund.amount_minor || refundEntity.status !== "processed") {
        throw new ValidationError("Provider refund does not match the pending fee refund");
      }
      const account = await ensureOwned(StudentFeeAccount, refund.account_id, schoolId, "Student fee account", session);
      if (refund.amount_minor > account.paid_minor) throw new ConflictError("Refund exceeds the account's confirmed paid amount");
      original.refund_reserved_minor = Math.max(0, Number(original.refund_reserved_minor || 0) - refund.amount_minor);
      account.paid_minor -= refund.amount_minor;
      let refundRemaining = refund.amount_minor;
      for (const installment of [...account.installments].sort((a, b) => new Date(b.due_date) - new Date(a.due_date))) {
        const take = Math.min(installment.paid_minor, refundRemaining);
        installment.paid_minor -= take;
        refundRemaining -= take;
        if (!refundRemaining) break;
      }
      refund.provider_refund_id = refundId;
      refund.reference = refundId;
      refund.status = "CONFIRMED";
      refund.confirmed_at = new Date();
      refund.notes = "Refund confirmed by provider webhook";
      await account.save({ session });
      await original.save({ session });
      await refund.save({ session });
      await audit(schoolId, null, "ONLINE_REFUND_CONFIRMED", "FeePayment", refund._id, { provider_refund_id: refundId, original_payment_id: original._id }, session);
      return { accepted: true, status: refund.status };
    });
  }
  const paymentEntity = body.payload?.payment?.entity;
  const orderEntity = body.payload?.order?.entity;
  const orderId = paymentEntity?.order_id || orderEntity?.id;
  if (!orderId || !["payment.captured", "payment.failed"].includes(event)) return { accepted: true, ignored: true };
  return sessionWork(async (session) => {
    const payment = await FeePayment.findOne(schoolFilter(schoolId, { provider_order_id: orderId, method: "ONLINE" })).session(session);
    if (!payment) return { accepted: true, ignored: true };
    if (payment.status === "CONFIRMED") {
      const incomingPaymentId = String(paymentEntity?.id || "");
      if (event === "payment.captured" && incomingPaymentId && incomingPaymentId !== String(payment.provider_payment_id || "")) {
        await audit(schoolId, null, "ONLINE_DUPLICATE_CAPTURE_REQUIRES_RECONCILIATION", "FeePayment", payment._id, { provider_order_id: orderId, provider_payment_id: incomingPaymentId, amount_minor: Number(paymentEntity.amount) || 0 }, session);
        return { accepted: true, reconciliation_required: true, status: payment.status };
      }
      return { accepted: true, duplicate: true, status: payment.status };
    }
    if (payment.status === "CANCELLED" && event === "payment.captured") {
      await audit(schoolId, null, "ONLINE_LATE_CAPTURE_REQUIRES_RECONCILIATION", "FeePayment", payment._id, { provider_order_id: orderId, provider_payment_id: String(paymentEntity?.id || ""), amount_minor: Number(paymentEntity?.amount) || 0 }, session);
      return { accepted: true, reconciliation_required: true, status: payment.status };
    }
    if (event === "payment.failed") {
      const failedId = String(paymentEntity?.id || "");
      if (!failedId) return { accepted: true, ignored: true };
      if ((payment.provider_failed_payment_ids || []).includes(failedId)) return { accepted: true, duplicate: true, status: payment.status };
      payment.provider_failed_payment_ids = [...(payment.provider_failed_payment_ids || []), failedId];
      payment.notes = "A payment attempt failed. The order remains open for retry until the provider confirms its final status.";
      await payment.save({ session });
      await audit(schoolId, null, "ONLINE_PAYMENT_ATTEMPT_FAILED", "FeePayment", payment._id, { provider_order_id: orderId, provider_payment_id: failedId }, session);
      return { accepted: true, status: payment.status };
    }
    const capturedAmount = Number(paymentEntity?.amount);
    if (paymentEntity?.currency !== "INR" || capturedAmount !== payment.amount_minor || paymentEntity?.status !== "captured") {
      throw new ValidationError("Captured payment does not match the pending fee transaction");
    }
    const account = await ensureOwned(StudentFeeAccount, payment.account_id, schoolId, "Student fee account", session);
    if (payment.amount_minor > accountDue(account) || payment.amount_minor > Number(account.reserved_minor || 0)) throw new ConflictError("The fee balance changed before payment confirmation");
    allocateToInstallments(account, payment.amount_minor);
    account.paid_minor += payment.amount_minor;
    account.reserved_minor = Math.max(0, Number(account.reserved_minor || 0) - payment.amount_minor);
    payment.status = "CONFIRMED";
    payment.provider_payment_id = String(paymentEntity.id);
    payment.reference = String(paymentEntity.id);
    payment.receipt_number = `RC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    payment.confirmed_at = new Date();
    payment.notes = "Payment confirmed by provider webhook";
    await account.save({ session });
    await payment.save({ session });
    await audit(schoolId, null, "ONLINE_PAYMENT_CONFIRMED", "FeePayment", payment._id, { provider_order_id: orderId, provider_payment_id: payment.provider_payment_id }, session);
    return { accepted: true, status: payment.status };
  });
};

const cancelOnlinePayment = async (user, paymentId) => {
  const schoolId = user?.school_id;
  const payment = await FeePayment.findOne(schoolFilter(schoolId, { _id: paymentId, method: "ONLINE", kind: "COLLECTION" })).lean();
  if (!payment) throw new NotFoundError("Online payment");
  assertPortalStudentAccess(user, payment.student_id);
  if (payment.status === "CANCELLED") return { status: "CANCELLED" };
  if (payment.status !== "PENDING" || !payment.provider_order_id) throw new ConflictError("Only pending online payments can be cancelled");
  const providerOrder = await PaymentProvider.getOrder(payment.provider_order_id);
  const providerPayments = await PaymentProvider.getOrderPayments(payment.provider_order_id);
  if (!PaymentProvider.isOrderSafelyExpired(providerOrder, providerPayments)) {
    return { status: "PENDING", message: "The provider has not confirmed this order as expired. Its reservation remains in place until a terminal provider status arrives." };
  }
  return sessionWork(async (session) => {
    const currentPayment = await FeePayment.findOne(schoolFilter(schoolId, { _id: payment._id })).session(session);
    if (!currentPayment || currentPayment.status !== "PENDING") return { status: currentPayment?.status || "NOT_FOUND" };
    const account = await ensureOwned(StudentFeeAccount, currentPayment.account_id, schoolId, "Student fee account", session);
    account.reserved_minor = Math.max(0, Number(account.reserved_minor || 0) - currentPayment.amount_minor);
    currentPayment.status = "CANCELLED";
    currentPayment.notes = "Payment cancelled after provider verification";
    await account.save({ session });
    await currentPayment.save({ session });
    await audit(schoolId, null, "ONLINE_PAYMENT_CANCELLED", "FeePayment", currentPayment._id, { provider_order_id: currentPayment.provider_order_id }, session);
    return { status: currentPayment.status };
  });
};

const applyAdjustment = async (schoolId, actorId, accountId, payload = {}) => {
  const amount = asMinor(payload.amount_minor, "Adjustment amount");
  const reason = String(payload.reason || "").trim();
  const kind = String(payload.kind || "CONCESSION").toUpperCase();
  if (!amount || !reason) throw new ValidationError("Adjustment amount and reason are required");
  if (!["CONCESSION", "ADJUSTMENT"].includes(kind)) throw new ValidationError("Unsupported adjustment type");
  const idempotencyKey = requestIdempotencyKey(payload);
  return sessionWork(async (session) => {
    const account = await ensureOwned(StudentFeeAccount, accountId, schoolId, "Student fee account", session);
    const existing = account.adjustments.find((item) => item.idempotency_key === idempotencyKey);
    if (existing) {
      if (existing.kind !== kind || existing.amount_minor !== amount) throw new ConflictError("The idempotency key was already used for another adjustment");
      return cleanAccount(account);
    }
    if (kind === "CONCESSION") {
      if (amount > accountAvailable(account)) throw new ValidationError("Concession cannot exceed the available outstanding balance");
      account.concession_minor += amount;
    } else {
      const delta = Number(payload.delta_minor);
      if (!Number.isSafeInteger(delta) || delta === 0 || Math.abs(delta) !== amount) throw new ValidationError("Adjustment delta is invalid");
      if (delta < 0 && Math.abs(delta) > accountAvailable(account)) throw new ValidationError("Adjustment cannot reduce the available balance below the amount already paid or reserved");
      if (!Number.isSafeInteger(Number(account.adjustment_minor || 0) + delta) || !Number.isSafeInteger(Number(account.gross_minor || 0) + Number(account.adjustment_minor || 0) + delta)) {
        throw new ValidationError("Adjustment exceeds the supported account amount");
      }
      account.adjustment_minor = Number(account.adjustment_minor || 0) + delta;
    }
    account.adjustments.push({ kind, amount_minor: amount, reason, approved_by: actorId, idempotency_key: idempotencyKey });
    await account.save({ session });
    await audit(schoolId, actorId, kind === "CONCESSION" ? "FEE_CONCESSION_APPROVED" : "FEE_ADJUSTMENT_APPROVED", "StudentFeeAccount", account._id, { amount_minor: amount, reason }, session);
    return cleanAccount(account);
  });
};

const refundPayment = async (schoolId, actorId, paymentId, payload = {}) => {
  const amount = asMinor(payload.amount_minor, "Refund amount");
  const reason = String(payload.reason || "").trim();
  if (!amount || !reason) throw new ValidationError("Refund amount and reason are required");
  const idempotencyKey = requestIdempotencyKey(payload);
  const prepared = await sessionWork(async (session) => {
    const existingRefund = await FeePayment.findOne(schoolFilter(schoolId, { idempotency_key: idempotencyKey })).session(session);
    if (existingRefund) {
      if (String(existingRefund.related_payment_id) !== String(paymentId) || existingRefund.amount_minor !== amount || existingRefund.kind !== "REFUND") throw new ConflictError("The idempotency key was already used for another transaction");
      if (existingRefund.method === "ONLINE" && !existingRefund.provider_refund_id && ["PENDING", "FAILED"].includes(existingRefund.status)) {
        const original = await ensureOwned(FeePayment, paymentId, schoolId, "Original fee payment", session);
        if (existingRefund.status === "FAILED") {
          const confirmedRefunds = await FeePayment.aggregate([
            { $match: schoolFilter(schoolId, { related_payment_id: original._id, kind: "REFUND", status: "CONFIRMED" }) },
            { $group: { _id: null, amount: { $sum: "$amount_minor" } } },
          ]).session(session);
          if (amount > original.amount_minor - Number(confirmedRefunds[0]?.amount || 0) - Number(original.refund_reserved_minor || 0)) {
            throw new ValidationError("Refund amount exceeds the unrefunded collection");
          }
          original.refund_reserved_minor = Number(original.refund_reserved_minor || 0) + amount;
          existingRefund.status = "PENDING";
          existingRefund.notes = "Online refund request is being retried";
          await original.save({ session });
          await existingRefund.save({ session });
        }
        return { refund: existingRefund.toObject(), processOnline: true, providerPaymentId: original.provider_payment_id };
      }
      return { refund: existingRefund.toObject(), processOnline: false };
    }
    const original = await ensureOwned(FeePayment, paymentId, schoolId, "Fee payment", session);
    if (original.kind !== "COLLECTION" || original.status !== "CONFIRMED") throw new ValidationError("Only confirmed collections can be refunded");
    const refunded = await FeePayment.aggregate([
      { $match: schoolFilter(schoolId, { related_payment_id: original._id, kind: "REFUND", status: "CONFIRMED" }) },
      { $group: { _id: null, amount: { $sum: "$amount_minor" } } },
    ]).session(session);
    const alreadyRefunded = Number(refunded[0]?.amount || 0);
    if (amount > original.amount_minor - alreadyRefunded - Number(original.refund_reserved_minor || 0)) throw new ValidationError("Refund amount exceeds the unrefunded collection");
    const account = await ensureOwned(StudentFeeAccount, original.account_id, schoolId, "Student fee account", session);
    if (amount > account.paid_minor) throw new ConflictError("Refund exceeds the account's confirmed paid amount");
    if (original.method === "ONLINE") {
      if (!PaymentProvider.isConfigured() || !original.provider_payment_id) throw new ValidationError("The online refund provider is not ready to refund this payment");
      original.refund_reserved_minor = Number(original.refund_reserved_minor || 0) + amount;
      await original.save({ session });
      const [refund] = await FeePayment.create([{
        school_id: schoolId, account_id: account._id, student_id: original.student_id,
        amount_minor: amount, kind: "REFUND", method: "ONLINE", status: "PENDING",
        idempotency_key: idempotencyKey, received_by: actorId,
        related_payment_id: original._id, notes: reason,
      }], { session });
      await audit(schoolId, actorId, "ONLINE_REFUND_REQUESTED", "FeePayment", refund._id, { amount_minor: amount, original_payment_id: original._id }, session);
      return { refund: refund.toObject(), processOnline: true, providerPaymentId: original.provider_payment_id };
    }
    account.paid_minor -= amount;
    let refundRemaining = amount;
    for (const installment of [...account.installments].sort((a, b) => new Date(b.due_date) - new Date(a.due_date))) {
      const take = Math.min(installment.paid_minor, refundRemaining);
      installment.paid_minor -= take;
      refundRemaining -= take;
      if (!refundRemaining) break;
    }
    await account.save({ session });
    const [refund] = await FeePayment.create([{
      school_id: schoolId, account_id: account._id, student_id: original.student_id,
      amount_minor: amount, kind: "REFUND", method: original.method,
      status: "CONFIRMED", idempotency_key: idempotencyKey,
      reference: String(payload.reference || "").trim(), received_by: actorId,
      related_payment_id: original._id, notes: reason, confirmed_at: new Date(),
    }], { session });
    await audit(schoolId, actorId, "FEE_PAYMENT_REFUNDED", "FeePayment", refund._id, { amount_minor: amount, original_payment_id: original._id, reason }, session);
    return { refund: refund.toObject(), processOnline: false };
  });
  if (!prepared.processOnline) return prepared.refund;
  if (!prepared.providerPaymentId) throw new ValidationError("The original provider payment reference is missing");
  try {
    const priorRefunds = await PaymentProvider.getPaymentRefunds(prepared.providerPaymentId);
    let providerRefund = priorRefunds.find((item) => String(item.notes?.fee_refund_id || "") === String(prepared.refund._id));
    if (!providerRefund) {
      providerRefund = await PaymentProvider.createRefund({
        paymentId: prepared.providerPaymentId, amountMinor: amount, receipt: prepared.refund._id,
        notes: { fee_refund_id: String(prepared.refund._id) },
      });
    }
    if (String(providerRefund.payment_id) !== String(prepared.providerPaymentId) || Number(providerRefund.amount) !== amount) {
      throw new ValidationError("Provider refund does not match the requested fee refund");
    }
    const refund = await FeePayment.findOneAndUpdate(
      schoolFilter(schoolId, { _id: prepared.refund._id, kind: "REFUND" }),
      { $set: { provider_refund_id: providerRefund.id, reference: providerRefund.id } },
      { new: true },
    ).lean();
    return refund;
  } catch (error) {
    await sessionWork(async (session) => {
      const refund = await FeePayment.findOne(schoolFilter(schoolId, { _id: prepared.refund._id, status: "PENDING" })).session(session);
      if (!refund) return;
      if (error.providerRejected) {
        const original = await ensureOwned(FeePayment, refund.related_payment_id, schoolId, "Original fee payment", session);
        original.refund_reserved_minor = Math.max(0, Number(original.refund_reserved_minor || 0) - refund.amount_minor);
        await original.save({ session });
        refund.status = "FAILED";
        refund.notes = "The provider rejected the refund request";
      } else {
        refund.notes = "The provider refund request status could not be confirmed. Reservation is held until the provider resolves it.";
      }
      await refund.save({ session });
      await audit(schoolId, actorId, "ONLINE_REFUND_REQUEST_FAILED", "FeePayment", refund._id, { reason: error.message }, session);
    });
    throw error;
  }
};

const listPayments = async (schoolId, filters = {}) => {
  const { page, limit } = parsePage(filters.page, filters.limit);
  const where = schoolFilter(schoolId);
  for (const key of ["student_id", "account_id", "status", "method", "kind"]) if (filters[key]) where[key] = filters[key];
  if (filters.q) {
    const matchingStudents = await Student.find(schoolFilter(schoolId, {
      $or: [
        { name: { $regex: escapeRegex(String(filters.q).trim()), $options: "i" } },
        { admission_number: { $regex: escapeRegex(String(filters.q).trim()), $options: "i" } },
        { roll_number: { $regex: escapeRegex(String(filters.q).trim()), $options: "i" } },
      ],
    })).select("_id").limit(500).lean();
    where.student_id = { $in: matchingStudents.map((student) => student._id) };
  }
  const createdAt = dateRangeFilter(filters.from, filters.to, "Payment date range");
  if (createdAt) where.createdAt = createdAt;
  const paymentSortFields = { createdAt: "createdAt", amount: "amount_minor", status: "status" };
  const sortField = paymentSortFields[filters.sort_by] || "createdAt";
  const sortDirection = String(filters.sort_direction).toLowerCase() === "asc" ? 1 : -1;
  const [payments, total] = await Promise.all([
    FeePayment.find(where).populate("student_id", "name roll_number admission_number")
      .populate("account_id", "structure_name academic_year_id")
      .populate("received_by", "username").sort({ [sortField]: sortDirection, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    FeePayment.countDocuments(where),
  ]);
  return { payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const getStudentFees = async (studentId, schoolId) => {
  const accounts = await StudentFeeAccount.find(schoolFilter(schoolId, { student_id: studentId, status: "ACTIVE" }))
    .populate("academic_year_id", "name").sort({ createdAt: -1 }).lean();
  const accountIds = accounts.map((account) => account._id);
  const payments = await FeePayment.find(schoolFilter(schoolId, { student_id: studentId, account_id: { $in: accountIds } }))
    .select("_id account_id amount_minor kind method status reference receipt_number confirmed_at createdAt provider_failed_payment_ids")
    .sort({ createdAt: -1 }).lean();
  const byAccount = new Map();
  for (const payment of payments) {
    const key = String(payment.account_id);
    byAccount.set(key, [...(byAccount.get(key) || []), payment]);
  }
  let gross = 0; let concessions = 0; let paid = 0; let outstanding = 0;
  const feeAccounts = accounts.map((account) => {
    const accountPayments = byAccount.get(String(account._id)) || [];
    const statement = cleanAccount(account);
    const dueByInstallment = effectiveInstallments(statement).map((installment) => {
      const dueDate = new Date(installment.due_date);
      return { ...installment, overdue: installment.balance_minor > 0 && dueDate < new Date() };
    });
    gross += statement.gross_minor;
    concessions += statement.concession_minor;
    paid += statement.paid_minor;
    outstanding += statement.balance_minor;
    return portalAccount({ ...statement, installments: dueByInstallment });
  });
  const onlineSettings = await School.findById(schoolId).select("settings.onlinePayments status").lean();
  const gatewayConfigured = Boolean(process.env.PAYMENT_GATEWAY_PROVIDER === "razorpay" && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET);
  const onlineEligible = onlineSettings?.status === "active" && onlineSettings?.settings?.onlinePayments?.enabled === true && onlineSettings.settings.onlinePayments.provider === "razorpay" && gatewayConfigured;
  return {
    summary: { gross_minor: gross, concessions_minor: concessions, paid_minor: paid, outstanding_minor: outstanding, currency: "INR" },
    accounts: feeAccounts,
    transactions: payments.map(portalPayment),
    online_payments: { enabled: onlineSettings?.settings?.onlinePayments?.enabled === true, eligible: onlineEligible, provider: onlineEligible ? "razorpay" : null, status: onlineEligible ? "READY" : "UNAVAILABLE" },
  };
};

const getPortalFees = async (user, requestedStudentId = null) => {
  if (user?.auth_type === "student") {
    assertPortalStudentAccess(user, user.student_id);
    if (requestedStudentId && String(requestedStudentId) !== String(user.student_id)) throw new AuthorizationError("Students can view only their own fee information");
    return getStudentFees(user.student_id, user.school_id);
  }
  if (user?.auth_type !== "user" || String(user?.role || "").toUpperCase() !== "PARENT") throw new AuthorizationError("Fee portal access is not available for this account");
  const allowedIds = (user.linked_student_ids || []).map(String);
  if (requestedStudentId && !allowedIds.includes(String(requestedStudentId))) throw new AuthorizationError("This student is not linked to your parent account");
  if (!allowedIds.length) return { children: [], selected_student_id: null };
  const ids = requestedStudentId ? [String(requestedStudentId)] : allowedIds;
  ids.forEach((id) => assertPortalStudentAccess(user, id));
  const children = await Student.find(schoolFilter(user.school_id, { _id: { $in: ids } })).select("_id name class section admission_number roll_number").lean();
  if (children.length !== ids.length) throw new AuthorizationError("One or more linked students are no longer available");
  const records = await Promise.all(children.map(async (student) => ({
    student: { id: String(student._id), name: student.name, class: student.class, section: student.section, admission_number: student.admission_number, roll_number: student.roll_number },
    ...(await getStudentFees(student._id, user.school_id)),
  })));
  return requestedStudentId ? { ...records[0], selected_student_id: String(requestedStudentId) } : { children: records, selected_student_id: null };
};

const getPortalReceipt = async (user, paymentId, requestedStudentId = null) => {
  if (user?.auth_type === "student") {
    assertPortalStudentAccess(user, user.student_id);
    if (requestedStudentId && String(requestedStudentId) !== String(user.student_id)) throw new AuthorizationError("Students can view only their own receipts");
    return portalReceipt(await getReceipt(user.school_id, paymentId, user.student_id));
  }
  if (user?.auth_type !== "user" || String(user?.role || "").toUpperCase() !== "PARENT") throw new AuthorizationError("Fee portal access is not available for this account");
  const allowedIds = (user.linked_student_ids || []).map(String);
  const payment = await FeePayment.findOne(schoolFilter(user.school_id, { _id: paymentId, kind: "COLLECTION", status: "CONFIRMED" })).select("student_id").lean();
  if (!payment || !allowedIds.includes(String(payment.student_id)) || (requestedStudentId && String(payment.student_id) !== String(requestedStudentId))) throw new AuthorizationError("This receipt is not available to your account");
  return portalReceipt(await getReceipt(user.school_id, paymentId, payment.student_id));
};

const portalReceipt = (payment) => ({
  ...portalPayment(payment),
  student_id: payment.student_id && {
    name: payment.student_id.name, admission_number: payment.student_id.admission_number,
    roll_number: payment.student_id.roll_number,
  },
  account_id: payment.account_id && { structure_name: payment.account_id.structure_name },
});

const getDashboard = async (schoolId, filters = {}) => {
  const accountMatch = schoolFilter(schoolId, { status: "ACTIVE" });
  if (filters.academic_year_id) accountMatch.academic_year_id = filters.academic_year_id;
  const accounts = await StudentFeeAccount.find(accountMatch).select("gross_minor concession_minor adjustment_minor paid_minor installments").lean();
  const outstanding = accounts.reduce((sum, account) => sum + accountDue(account), 0);
  const assigned = accounts.reduce((sum, account) => sum + account.gross_minor + account.adjustment_minor, 0);
  const concessions = accounts.reduce((sum, account) => sum + account.concession_minor, 0);
  const now = new Date();
  const overdue = accounts.reduce((sum, account) => sum + effectiveInstallments(account).reduce((itemSum, item) =>
    itemSum + (new Date(item.due_date) < now ? item.balance_minor : 0), 0), 0);
  const paymentMatch = schoolFilter(schoolId, { status: { $in: ["INITIATED", "PENDING"] }, kind: "COLLECTION" });
  const onlinePending = await FeePayment.aggregate([{ $match: paymentMatch }, { $group: { _id: null, total: { $sum: "$amount_minor" }, count: { $sum: 1 } } }]);
  const since = new Date(); since.setDate(1); since.setHours(0, 0, 0, 0);
  const collected = await FeePayment.aggregate([
    { $match: schoolFilter(schoolId, { status: "CONFIRMED", createdAt: { $gte: since } }) },
    { $group: { _id: { method: "$method", day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, amount: { $sum: { $cond: [{ $in: ["$kind", ["REFUND", "REVERSAL"]] }, { $multiply: ["$amount_minor", -1] }, "$amount_minor"] } } } },
    { $sort: { "_id.day": 1 } },
  ]);
  const collectedThisMonth = collected.reduce((sum, row) => sum + row.amount, 0);
  return { assigned_minor: assigned, collected_this_month_minor: collectedThisMonth, outstanding_minor: outstanding, overdue_minor: overdue, concessions_minor: concessions, pending_online_minor: onlinePending[0]?.total || 0, pending_online_count: onlinePending[0]?.count || 0, collection_by_day_and_method: collected };
};

const getReport = async (schoolId, filters = {}) => {
  const { page, limit } = parsePage(filters.page, filters.limit);
  const accountMatch = schoolFilter(schoolId, { status: "ACTIVE" });
  if (filters.academic_year_id) accountMatch.academic_year_id = filters.academic_year_id;
  if (filters.course_id) accountMatch.course_id = filters.course_id;
  const [accountMetrics, pageAccounts] = await Promise.all([
    StudentFeeAccount.find(accountMatch).select("course_id gross_minor concession_minor adjustment_minor paid_minor installments").lean(),
    StudentFeeAccount.find(accountMatch)
      .populate("student_id", "name admission_number roll_number section")
      .populate("course_id", "course_name course_code")
      .populate("academic_year_id", "name")
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  const courseIds = [...new Set(accountMetrics.map((account) => String(account.course_id)))];
  const courses = await Course.find(schoolFilter(schoolId, { _id: { $in: courseIds } })).select("course_name").lean();
  const courseNames = new Map(courses.map((course) => [String(course._id), course.course_name]));
  const now = new Date();
  const reportRows = pageAccounts.map((account) => {
    const overdueMinor = effectiveInstallments(account).reduce((sum, installment) =>
      sum + (new Date(installment.due_date) < now ? installment.balance_minor : 0), 0);
    return {
      account_id: account._id,
      student: account.student_id,
      course: account.course_id,
      academic_year: account.academic_year_id,
      structure_name: account.structure_name,
      assigned_minor: Number(account.gross_minor || 0) + Number(account.adjustment_minor || 0),
      concession_minor: Number(account.concession_minor || 0),
      paid_minor: Number(account.paid_minor || 0),
      balance_minor: accountDue(account),
      overdue_minor: overdueMinor,
    };
  });
  const byCourse = new Map();
  const totals = { accounts: accountMetrics.length, assigned_minor: 0, concessions_minor: 0, paid_minor: 0, outstanding_minor: 0, overdue_minor: 0 };
  for (const account of accountMetrics) {
    const courseId = String(account.course_id || "unassigned");
    const assigned = Number(account.gross_minor || 0) + Number(account.adjustment_minor || 0);
    const concession = Number(account.concession_minor || 0);
    const paid = Number(account.paid_minor || 0);
    const balance = accountDue(account);
    const overdue = effectiveInstallments(account).reduce((sum, installment) =>
      sum + (new Date(installment.due_date) < now ? installment.balance_minor : 0), 0);
    const group = byCourse.get(courseId) || {
      course_id: account.course_id || null,
      course_name: courseNames.get(courseId) || "Unassigned",
      accounts: 0, assigned_minor: 0, concessions_minor: 0, paid_minor: 0, outstanding_minor: 0, overdue_minor: 0,
    };
    group.accounts += 1;
    group.assigned_minor += assigned;
    group.concessions_minor += concession;
    group.paid_minor += paid;
    group.outstanding_minor += balance;
    group.overdue_minor += overdue;
    totals.assigned_minor += assigned;
    totals.concessions_minor += concession;
    totals.paid_minor += paid;
    totals.outstanding_minor += balance;
    totals.overdue_minor += overdue;
    byCourse.set(courseId, group);
  }
  const paymentMatch = schoolFilter(schoolId, { status: "CONFIRMED" });
  const createdAt = dateRangeFilter(filters.from, filters.to, "Report date range");
  if (createdAt) paymentMatch.createdAt = createdAt;
  const methods = await FeePayment.aggregate([
    { $match: paymentMatch },
    { $group: { _id: { method: "$method", kind: "$kind" }, amount_minor: { $sum: "$amount_minor" }, count: { $sum: 1 } } },
  ]);
  const methodSummary = new Map();
  for (const row of methods) {
    const method = row._id.method;
    const current = methodSummary.get(method) || { method, collected_minor: 0, refunded_minor: 0, net_minor: 0, transactions: 0 };
    if (row._id.kind === "REFUND" || row._id.kind === "REVERSAL") current.refunded_minor += row.amount_minor;
    else current.collected_minor += row.amount_minor;
    current.net_minor = current.collected_minor - current.refunded_minor;
    current.transactions += row.count;
    methodSummary.set(method, current);
  }
  return {
    summary: totals,
    by_course: [...byCourse.values()].sort((a, b) => a.course_name.localeCompare(b.course_name)),
    payment_methods: [...methodSummary.values()].sort((a, b) => a.method.localeCompare(b.method)),
    rows: reportRows,
    pagination: { page, limit, total: accountMetrics.length, pages: Math.ceil(accountMetrics.length / limit) },
  };
};

const getReceipt = async (schoolId, paymentId, studentId = null) => {
  const where = schoolFilter(schoolId, { _id: paymentId, kind: "COLLECTION", status: "CONFIRMED" });
  if (studentId) where.student_id = studentId;
  const payment = await FeePayment.findOne(where).populate("student_id", "name roll_number admission_number class section")
    .populate("account_id", "structure_name academic_year_id").populate("received_by", "username").lean();
  if (!payment) throw new NotFoundError("Confirmed fee receipt");
  return payment;
};

const setOnlinePaymentSettings = async (schoolId, actorId, payload = {}) => {
  const enabled = payload.enabled === true;
  const provider = payload.provider === "razorpay" ? "razorpay" : "";
  const gatewayConfigured = provider === "razorpay" && process.env.PAYMENT_GATEWAY_PROVIDER === "razorpay" && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET;
  if (enabled && !gatewayConfigured) throw new ValidationError("Online payments cannot be enabled until the server has a supported provider and all required credentials configured");
  const currentSchool = await School.findById(schoolId).select("status").lean();
  if (!currentSchool) throw new NotFoundError("School");
  if (enabled && currentSchool.status !== "active") throw new ValidationError("Online payments cannot be enabled for an inactive school");
  const school = await School.findByIdAndUpdate(schoolId, { $set: {
    "settings.onlinePayments.enabled": enabled,
    "settings.onlinePayments.provider": enabled ? provider : "",
    "settings.onlinePayments.updatedBy": actorId,
    "settings.onlinePayments.updatedAt": new Date(),
  } }, { new: true, runValidators: true }).select("_id school_name status settings.onlinePayments").lean();
  if (!school) throw new NotFoundError("School");
  await FeeAudit.create({ school_id: schoolId, actor_id: actorId, action: enabled ? "ONLINE_PAYMENTS_ENABLED" : "ONLINE_PAYMENTS_DISABLED", entity_type: "School", entity_id: schoolId, details: { provider: enabled ? provider : null } });
  return { enabled: school.settings?.onlinePayments?.enabled === true, provider: school.settings?.onlinePayments?.provider || null, status: gatewayConfigured && enabled ? "READY" : enabled ? "MISCONFIGURED" : "DISABLED", credentials_configured: Boolean(gatewayConfigured), updated_at: school.settings?.onlinePayments?.updatedAt || null };
};

const getOnlinePaymentSettings = async (schoolId) => {
  const school = await School.findById(schoolId).select("status settings.onlinePayments").lean();
  if (!school) throw new NotFoundError("School");
  const config = school.settings?.onlinePayments || {};
  const credentialsConfigured = Boolean(config.provider === "razorpay" && process.env.PAYMENT_GATEWAY_PROVIDER === "razorpay" && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET);
  return { enabled: config.enabled === true, provider: config.provider || null, credentials_configured: credentialsConfigured, status: school.status !== "active" ? "SCHOOL_INACTIVE" : !config.enabled ? "DISABLED" : credentialsConfigured ? "READY" : "MISCONFIGURED", updated_at: config.updatedAt || null };
};

const listAudit = async (schoolId, filters = {}) => FeeAudit.find(schoolFilter(schoolId, filters.entity_type ? { entity_type: filters.entity_type } : {}))
  .populate("actor_id", "username role").sort({ createdAt: -1 }).limit(Math.min(200, parsePage(1, filters.limit).limit)).lean();

const run = (fn) => async (...args) => { try { return success(await fn(...args)); } catch (error) { return failure(error); } };

module.exports = {
  listFeeTypes: run(listFeeTypes), saveFeeType: run(saveFeeType), listStructures: run(listStructures), saveStructure: run(saveStructure),
  assignStructure: run(assignStructure), provisionParentAccess: run(provisionParentAccess), listAccounts: run(listAccounts), getAccount: run(getAccount), recordCollection: run(recordCollection), initiateOnlinePayment: run(initiateOnlinePayment), handlePaymentWebhook: run(handlePaymentWebhook), cancelOnlinePayment: run(cancelOnlinePayment),
  applyAdjustment: run(applyAdjustment), refundPayment: run(refundPayment), listPayments: run(listPayments), getStudentFees: run(getStudentFees),
  getDashboard: run(getDashboard), getPortalFees: run(getPortalFees), getPortalReceipt: run(getPortalReceipt), getReceipt: run(getReceipt), setOnlinePaymentSettings: run(setOnlinePaymentSettings),
  getOnlinePaymentSettings: run(getOnlinePaymentSettings), listAudit: run(listAudit), getReport: run(getReport),
};
