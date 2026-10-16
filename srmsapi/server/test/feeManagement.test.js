"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { asMinor, accountDue, accountAvailable, schoolFilter, effectiveInstallments } = require("../src/services/feeMath");
const { assertPortalStudentAccess } = require("../src/services/feeAuthorization");
const PaymentProvider = require("../src/services/payment/PaymentProvider");
const tenantScopePlugin = require("../src/middleware/tenantScopePlugin");
const { runWithTenant } = require("../src/middleware/tenantContext");

test("money calculations use integer minor units and account for concessions, refunds, and reservations", () => {
  assert.equal(asMinor("12550"), 12550);
  assert.throws(() => asMinor("12.55"), /integer amount in minor currency units/);
  assert.throws(() => asMinor(-1), /non-negative/);
  const account = { gross_minor: 10000, concession_minor: 1000, adjustment_minor: 500, paid_minor: 2000, reserved_minor: 1500 };
  assert.equal(accountDue(account), 7500);
  assert.equal(accountAvailable(account), 6000);
});

test("school scope cannot be overridden by extra query filters", () => {
  assert.deepEqual(schoolFilter("school-a", { school_id: "school-b", status: "ACTIVE" }), {
    school_id: "school-a", status: "ACTIVE",
  });
});

test("school scope casts ObjectId strings for native aggregation pipelines", () => {
  const id = new mongoose.Types.ObjectId();
  const filter = schoolFilter(String(id), { status: "CONFIRMED" });
  assert.ok(filter.school_id instanceof mongoose.Types.ObjectId);
  assert.equal(String(filter.school_id), String(id));
});

test("tenant aggregation scope casts school IDs to the schema field type", async () => {
  const id = new mongoose.Types.ObjectId();
  const schema = new mongoose.Schema({ school_id: { type: mongoose.Schema.Types.ObjectId } });
  schema.plugin(tenantScopePlugin);
  const Model = mongoose.model("TenantAggregateScopeTest", schema);
  const originalAggregate = Model.collection.aggregate;
  let observedPipeline;
  Model.collection.aggregate = (pipeline) => {
    observedPipeline = pipeline;
    return { toArray: async () => [] };
  };

  let pending;
  runWithTenant({ _id: id, slug: "test-school" }, () => {
    pending = Model.aggregate([{ $count: "total" }]).exec();
  });
  try {
    await pending;
    assert.ok(observedPipeline[0].$match.school_id instanceof mongoose.Types.ObjectId);
    assert.equal(String(observedPipeline[0].$match.school_id), String(id));
  } finally {
    Model.collection.aggregate = originalAggregate;
    mongoose.deleteModel("TenantAggregateScopeTest");
  }
});

test("installment balances apply concessions to later installments and retain paid amounts", () => {
  const installments = effectiveInstallments({
    concession_minor: 250,
    adjustment_minor: 50,
    installments: [
      { name: "First", due_date: "2026-01-01", amount_minor: 500, paid_minor: 300 },
      { name: "Second", due_date: "2026-02-01", amount_minor: 500, paid_minor: 0 },
    ],
  });
  assert.deepEqual(installments.map(({ effective_amount_minor, balance_minor }) => [effective_amount_minor, balance_minor]), [
    [500, 200], [300, 300],
  ]);
  assert.equal(installments.reduce((total, item) => total + item.balance_minor, 0), 500);
});

test("installment calculations support Mongoose subdocuments used by collection transactions", () => {
  const schema = new mongoose.Schema({ gross_minor: Number, concession_minor: Number, adjustment_minor: Number, installments: [{ name: String, due_date: Date, amount_minor: Number, paid_minor: Number }] });
  const Account = mongoose.models.FeeMathSubdocumentTest || mongoose.model("FeeMathSubdocumentTest", schema);
  const account = new Account({ gross_minor: 500, concession_minor: 100, installments: [{ name: "Term", due_date: "2026-01-01", amount_minor: 500, paid_minor: 150 }] });
  const [installment] = effectiveInstallments(account);
  assert.equal(installment.effective_amount_minor, 400);
  assert.equal(installment.balance_minor, 250);
  assert.ok(installment._id);
});

test("students and parents are restricted to their own or explicitly linked students", () => {
  const student = { auth_type: "student", school_id: "school-a", student_id: "student-a" };
  assert.equal(assertPortalStudentAccess(student, "student-a"), true);
  assert.throws(() => assertPortalStudentAccess(student, "student-b"), /only their own/);

  const parent = { auth_type: "user", role: "PARENT", school_id: "school-a", linked_student_ids: ["student-a", "student-c"] };
  assert.equal(assertPortalStudentAccess(parent, "student-c"), true);
  assert.throws(() => assertPortalStudentAccess(parent, "student-b"), /not linked/);
  assert.throws(() => assertPortalStudentAccess({ ...parent, school_id: null }, "student-a"), /school account/);
  assert.throws(() => assertPortalStudentAccess({ auth_type: "user", role: "TEACHER", school_id: "school-a" }, "student-a"), /not available/);
});

test("Razorpay webhook verification accepts only the configured HMAC signature", (t) => {
  const old = {
    provider: process.env.PAYMENT_GATEWAY_PROVIDER,
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  };
  t.after(() => {
    for (const [key, value] of Object.entries({
      PAYMENT_GATEWAY_PROVIDER: old.provider,
      RAZORPAY_KEY_ID: old.keyId,
      RAZORPAY_KEY_SECRET: old.keySecret,
      RAZORPAY_WEBHOOK_SECRET: old.webhookSecret,
    })) value === undefined ? delete process.env[key] : process.env[key] = value;
  });
  process.env.PAYMENT_GATEWAY_PROVIDER = "razorpay";
  process.env.RAZORPAY_KEY_ID = "test_key";
  process.env.RAZORPAY_KEY_SECRET = "test_secret";
  process.env.RAZORPAY_WEBHOOK_SECRET = "webhook_secret";
  const body = Buffer.from(JSON.stringify({ event: "payment.captured" }));
  const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
  assert.equal(PaymentProvider.verifyWebhook(body, signature), true);
  assert.equal(PaymentProvider.verifyWebhook(body, "00".repeat(32)), false);
  assert.equal(PaymentProvider.verifyWebhook("not a buffer", signature), false);
});

test("online order reservations release only after confirmed provider expiry", () => {
  assert.equal(PaymentProvider.isOrderSafelyExpired({ status: "created" }, [{ status: "failed" }]), false);
  assert.equal(PaymentProvider.isOrderSafelyExpired({ status: "expired" }, [{ status: "failed" }]), true);
  assert.equal(PaymentProvider.isOrderSafelyExpired({ status: "expired" }, [{ status: "authorized" }]), false);
  assert.equal(PaymentProvider.isOrderSafelyExpired({ status: "expired" }, [{ status: "captured" }]), false);
});
