"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { asMinor, accountDue, accountAvailable, schoolFilter, effectiveInstallments } = require("../src/services/feeMath");
const { assertPortalStudentAccess } = require("../src/services/feeAuthorization");
const PaymentProvider = require("../src/services/payment/PaymentProvider");
const CredentialCrypto = require("../src/services/payment/credentialCrypto");
const tenantScopePlugin = require("../src/middleware/tenantScopePlugin");
const { runWithTenant } = require("../src/middleware/tenantContext");
const { Gateway, SchoolGateway } = require("../src/db/models");
const { GATEWAY_CATALOG, seedGatewayCatalog } = require("../src/db/mongo/seeders/gateway.seeder");
const SchoolGatewayService = require("../src/services/SchoolGatewayService");

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

test("payment credentials use authenticated encryption and fail closed without a key", () => {
  const original = process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY;
  process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
  const encrypted = CredentialCrypto.encrypt("school-secret");
  assert.notEqual(encrypted, "school-secret");
  assert.equal(CredentialCrypto.decrypt(encrypted), "school-secret");
  assert.throws(() => CredentialCrypto.decrypt(encrypted.replace(/.$/, "x")), /cannot be decrypted/);
  delete process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY;
  assert.throws(() => CredentialCrypto.encrypt("secret"), /encryption is unavailable/);
  if (original !== undefined) process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY = original;
});

test("Razorpay webhook signatures require the selected school's secret", () => {
  const body = Buffer.from('{"event":"payment.captured"}');
  const secret = "school-webhook-secret";
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(PaymentProvider.verifyWebhook(body, signature, secret), true);
  assert.equal(PaymentProvider.verifyWebhook(body, signature, "another-school-secret"), false);
  assert.equal(PaymentProvider.verifyWebhook(body, signature, ""), false);
});

test("gateway catalog seeding is idempotent and preserves platform availability", async () => {
  const operations = [];
  const db = { Gateway: { findOneAndUpdate: async (...args) => { operations.push(args); } } };
  assert.equal(await seedGatewayCatalog(db), 3);
  assert.equal(await seedGatewayCatalog(db), 3);
  assert.deepEqual(GATEWAY_CATALOG.map((gateway) => gateway.code), ["razorpay", "cashfree", "phonepe"]);
  assert.equal(operations.length, 6);
  assert.equal(operations[0][1].$set.integrationStatus, "implemented");
  assert.deepEqual(operations[0][1].$setOnInsert, { isEnabled: true });
  assert.equal(operations[0][1].$set.isEnabled, undefined);
  assert.equal(operations[0][1].$set.gatewayId, "razorpay");
  assert.equal(operations[0][1].$set.configurationFields[0].fieldKey, "key_id");
  assert.deepEqual(operations[0][1].$set.configurationFields[0].environmentApplicability, ["test", "live"]);
  assert.ok(operations[0][1].$set.configurationFields[0].helpText);
});

test("school gateway credentials remain encrypted and isolated by environment", async () => {
  const oldKey = process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY;
  process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
  const gateway = GATEWAY_CATALOG[0];
  gateway._id = "gateway-test-id";
  let stored;
  const originals = {
    gatewayFindOne: Gateway.findOne, gatewayFindById: Gateway.findById,
    configFindOne: SchoolGateway.findOne, configUpdate: SchoolGateway.findOneAndUpdate,
    auditCreate: require("../src/db/models").FeeAudit.create,
  };
  Gateway.findOne = () => ({ lean: async () => gateway });
  Gateway.findById = () => ({ lean: async () => gateway });
  SchoolGateway.findOne = () => ({ lean: async () => stored });
  SchoolGateway.findOneAndUpdate = async (_filter, update) => {
    stored = { ...(stored || {}), ...update.$set, ...(update.$setOnInsert || {}), _id: "school-gateway-id", gateway_id: gateway._id };
    return { ...stored, toObject: () => ({ ...stored }) };
  };
  require("../src/db/models").FeeAudit.create = async () => ({});
  try {
    const secrets = { keyId: "rzp_test_school", keySecret: "test-secret", webhookSecret: "test-hook" };
    const savedTest = await SchoolGatewayService.configure("school-id", "actor-id", "razorpay", { environment: "test", credentials: secrets });
    assert.equal(savedTest.credentialsConfigured, true);
    assert.equal(JSON.stringify(savedTest).includes("test-secret"), false);
    const savedTestValues = JSON.parse(CredentialCrypto.decrypt(stored.configuration_encrypted));
    assert.equal(savedTestValues.test.credentials.keySecret, "test-secret");
    await SchoolGatewayService.configure("school-id", "actor-id", "razorpay", { environment: "live", credentials: { keyId: "rzp_live_school", keySecret: "live-secret", webhookSecret: "live-hook" } });
    const allValues = JSON.parse(CredentialCrypto.decrypt(stored.configuration_encrypted));
    assert.equal(allValues.test.credentials.keySecret, "test-secret");
    assert.equal(allValues.live.credentials.keySecret, "live-secret");
    assert.equal(await SchoolGatewayService.loadCredentials("school-id", gateway._id, "test").then((value) => value.keySecret), "test-secret");
    assert.equal(await SchoolGatewayService.loadCredentials("school-id", gateway._id, "live").then((value) => value.keySecret), "live-secret");
  } finally {
    Gateway.findOne = originals.gatewayFindOne; Gateway.findById = originals.gatewayFindById;
    SchoolGateway.findOne = originals.configFindOne; SchoolGateway.findOneAndUpdate = originals.configUpdate;
    require("../src/db/models").FeeAudit.create = originals.auditCreate;
    if (oldKey === undefined) delete process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY;
    else process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY = oldKey;
  }
});

test("gateway migration moves legacy credentials into encrypted environment configuration", async () => {
  const oldKey = process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY;
  process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
  const gateway = GATEWAY_CATALOG[0];
  gateway._id = "gateway-migration-id";
  const legacy = {
    _id: "school-gateway-migration-id", gateway_id: gateway._id, environment: "test",
    key_id: "rzp_test_legacy", key_secret_encrypted: CredentialCrypto.encrypt("legacy-secret"),
    webhook_secret_encrypted: CredentialCrypto.encrypt("legacy-webhook"), credentialsConfigured: true,
  };
  let update;
  const migration = require("../src/db/mongo/migrations/007_encrypt_gateway_environment_configs");
  const db = {
    Gateway: { find: () => ({ lean: async () => [gateway] }) },
    SchoolGateway: { collection: {
      find: () => ({ toArray: async () => [legacy] }),
      updateOne: async (_filter, operation) => { update = operation; },
      createIndex: async () => {},
    } },
  };
  try {
    await migration.up(db);
    const migrated = JSON.parse(CredentialCrypto.decrypt(update.$set.configuration_encrypted));
    assert.equal(migrated.test.configuration.keyId, "rzp_test_legacy");
    assert.equal(migrated.test.credentials.keySecret, "legacy-secret");
    assert.equal(migrated.test.credentials.webhookSecret, "legacy-webhook");
    assert.deepEqual(Object.keys(update.$unset).sort(), ["credentials_encrypted", "key_id", "key_secret_encrypted", "webhook_secret_encrypted"].sort());
    assert.equal(update.$set.configuration_encrypted.includes("legacy-secret"), false);
  } finally {
    if (oldKey === undefined) delete process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY;
    else process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY = oldKey;
  }
});

test("school gateway model declares unique school-provider configuration", () => {
  const uniqueIndex = SchoolGateway.schema.indexes().find(([keys, options]) => keys.school_id === 1 && keys.gateway_id === 1 && options.unique);
  assert.ok(uniqueIndex);
  assert.equal(uniqueIndex[1].name, "unique_school_gateway_provider");
  assert.equal(Gateway.schema.path("code").options.unique, true);
});

test("a school cannot enable a gateway until its configuration is ready", async () => {
  const originals = { gatewayFindOne: Gateway.findOne, configFindOne: SchoolGateway.findOne };
  const gateway = { ...GATEWAY_CATALOG[0], _id: "gateway-ready-check", isEnabled: true };
  const config = {
    credentialsConfigured: true, configurationStatus: "VALIDATION_REQUIRED", validationStatus: "VALID",
    save: async () => { throw new Error("A non-ready gateway must not be saved as enabled"); },
  };
  Gateway.findOne = () => ({ lean: async () => gateway });
  SchoolGateway.findOne = async () => config;
  try {
    await assert.rejects(SchoolGatewayService.setEnabled("school-ready-check", "actor", "razorpay", true), /validated credentials and be available/);
  } finally {
    Gateway.findOne = originals.gatewayFindOne;
    SchoolGateway.findOne = originals.configFindOne;
  }
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

test("Razorpay webhook verification accepts only the school's HMAC signature", () => {
  const body = Buffer.from(JSON.stringify({ event: "payment.captured" }));
  const signature = crypto.createHmac("sha256", "school-secret").update(body).digest("hex");
  assert.equal(PaymentProvider.verifyWebhook(body, signature, "school-secret"), true);
  assert.equal(PaymentProvider.verifyWebhook(body, signature, "other-school-secret"), false);
  assert.equal(PaymentProvider.verifyWebhook("not a buffer", signature, "school-secret"), false);
});

test("Razorpay sandbox Checkout responses require the order/payment signature", () => {
  const fields = { orderId: "order_sandbox", paymentId: "pay_sandbox", keySecret: "school_test_secret" };
  const signature = crypto.createHmac("sha256", fields.keySecret).update(`${fields.orderId}|${fields.paymentId}`).digest("hex");
  assert.equal(PaymentProvider.verifyCheckoutSignature({ ...fields, signature }), true);
  assert.equal(PaymentProvider.verifyCheckoutSignature({ ...fields, signature, keySecret: "another_secret" }), false);
  assert.equal(PaymentProvider.verifyCheckoutSignature({ ...fields, signature: "" }), false);
});

test("online order reservations release only after confirmed provider expiry", () => {
  assert.equal(PaymentProvider.isOrderSafelyExpired({ status: "created" }, [{ status: "failed" }]), false);
  assert.equal(PaymentProvider.isOrderSafelyExpired({ status: "expired" }, [{ status: "failed" }]), true);
  assert.equal(PaymentProvider.isOrderSafelyExpired({ status: "expired" }, [{ status: "authorized" }]), false);
  assert.equal(PaymentProvider.isOrderSafelyExpired({ status: "expired" }, [{ status: "captured" }]), false);
});
