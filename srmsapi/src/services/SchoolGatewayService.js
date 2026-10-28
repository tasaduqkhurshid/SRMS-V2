"use strict";

const crypto = require("node:crypto");
const { Gateway, SchoolGateway, School, FeeAudit } = require("../db/models");
const { ValidationError, NotFoundError, ConflictError } = require("../utils/applicationErrors");
const { encrypt, decrypt } = require("./payment/credentialCrypto");
const methodsByProvider = { razorpay: ["upi", "card", "netbanking", "wallet"] };
const decryptConfiguration = (row) => {
  if (!row?.configuration_encrypted) return {};
  try { return JSON.parse(decrypt(row.configuration_encrypted)); } catch { return {}; }
};
const environmentValues = (row, environment = row?.environment || "test") => {
  const values = decryptConfiguration(row);
  if (values.test || values.live) return values[environment] || { credentials: {}, configuration: {} };
  // Compatibility for records written before the environment-scoped migration.
  return environment === (row?.environment || "test") ? { credentials: values, configuration: {} } : { credentials: {}, configuration: {} };
};
const safe = (row) => {
  const gateway = row.gateway_id && typeof row.gateway_id === "object" ? row.gateway_id : {};
  const fields = gateway.configurationFields || [];
  const saved = environmentValues(row);
  const storedValues = { ...(saved.credentials || {}), ...(saved.configuration || {}) };
  const configuredFields = fields.filter((field) => Boolean(storedValues[field.srmField] || storedValues[field.providerField])).map((field) => field.srmField);
  return {
    _id: row._id, gateway_id: gateway._id || row.gateway_id,
    code: gateway.code, name: gateway.name, description: gateway.description,
    integrationStatus: gateway.integrationStatus, platformEnabled: gateway.isEnabled,
    supportedPaymentMethods: gateway.supportedPaymentMethods || [], configurationFields: fields,
    customizationPolicy: gateway.customizationPolicy || [], schemaVersion: gateway.schemaVersion || 1,
    capabilities: gateway.capabilities || {}, isEnabled: Boolean(row.isEnabled),
    environment: row.environment || gateway.defaultConfiguration?.environment || "test", paymentMethods: row.paymentMethods || gateway.defaultConfiguration?.paymentMethods || gateway.supportedPaymentMethods || [],
    credentialsConfigured: Boolean(row.credentialsConfigured), configuredFields,
    configurationStatus: row.configurationStatus || "NOT_CONFIGURED",
    validationStatus: row.validationStatus || "NOT_VALIDATED", validationMessage: row.validationMessage || "",
    lastValidatedAt: row.lastValidatedAt, updatedAt: row.updatedAt,
  };
};
const list = async (schoolId) => {
  const gateways = await Gateway.find({}).sort({ name: 1 }).lean();
  const configs = await SchoolGateway.find({ school_id: schoolId }).lean();
  const byId = new Map(configs.map((entry) => [String(entry.gateway_id), entry]));
  return gateways.map((gateway) => safe({ ...(byId.get(String(gateway._id)) || {}), gateway_id: gateway }));
};
const configure = async (schoolId, actorId, code, input = {}) => {
  const gateway = await Gateway.findOne({ code }).lean();
  if (!gateway) throw new NotFoundError("Payment gateway");
  const fields = gateway.configurationFields || [];
  if (!fields.length) throw new ConflictError("This gateway has no credential fields configured in its seeder");
  const previous = await SchoolGateway.findOne({ school_id: schoolId, gateway_id: gateway._id }).lean();
  const environment = input.environment ?? previous?.environment ?? gateway.defaultConfiguration?.environment ?? "test";
  if (!["test", "live"].includes(environment) || !gateway.capabilities?.[environment === "test" ? "supportsTestMode" : "supportsLiveMode"]) throw new ValidationError("The selected environment is not supported");
  const environmentFields = fields.filter((field) => (field.environmentApplicability || ["test", "live"]).includes(environment));
  const saved = environmentValues(previous, environment);
  const credentials = { ...(saved.credentials || {}) };
  const configuration = { ...(saved.configuration || {}) };
  const incoming = input.credentials || {};
  const incomingConfiguration = input.configuration || {};
  for (const field of environmentFields) {
    const value = incoming[field.srmField] ?? incoming[field.providerField] ?? input[field.srmField] ?? input[field.providerField];
    if (value !== undefined && String(value).trim() !== "") {
      validateField(field, value, environment);
      (field.secret ? credentials : configuration)[field.srmField] = String(value).trim();
    } else if (field.required && !credentials[field.srmField] && !configuration[field.srmField]) {
      throw new ValidationError(`${field.label} is required`);
    }
    const configValue = incomingConfiguration[field.srmField] ?? incomingConfiguration[field.providerField];
    if (configValue !== undefined && String(configValue).trim() !== "") {
      validateField(field, configValue, environment);
      (field.secret ? credentials : configuration)[field.srmField] = String(configValue).trim();
    }
  }
  const credentialsConfigured = environmentFields.filter((field) => field.required).every((field) => Boolean(credentials[field.srmField] || configuration[field.srmField]));
  const allEnvironments = decryptConfiguration(previous);
  const environmentMap = allEnvironments.test || allEnvironments.live ? allEnvironments : { [previous?.environment || "test"]: { credentials: allEnvironments, configuration: {} } };
  environmentMap[environment] = { credentials, configuration };
  const supportedMethods = gateway.supportedPaymentMethods || [];
  const paymentMethods = input.paymentMethods === undefined ? (previous?.paymentMethods?.length ? previous.paymentMethods : supportedMethods) : [...new Set(input.paymentMethods)];
  if (!Array.isArray(paymentMethods) || paymentMethods.some((method) => !supportedMethods.includes(method))) throw new ValidationError("Select payment methods supported by this provider");
  const config = await SchoolGateway.findOneAndUpdate({ school_id: schoolId, gateway_id: gateway._id }, {
    $set: {
      updatedBy: actorId, environment, paymentMethods,
      configuration_encrypted: encrypt(JSON.stringify(environmentMap)), credentialsConfigured,
      configurationStatus: credentialsConfigured ? "VALIDATION_REQUIRED" : "NOT_CONFIGURED",
      validationStatus: "NOT_VALIDATED", validationMessage: "", isEnabled: previous?.isEnabled || false,
    },
    $setOnInsert: { school_id: schoolId, gateway_id: gateway._id, createdBy: actorId },
  }, { upsert: true, new: true, runValidators: true });
  await FeeAudit.create({ school_id: schoolId, actor_id: actorId, action: "PAYMENT_GATEWAY_CONFIGURED", entity_type: "SchoolGateway", entity_id: config._id, details: { gateway: code, credentialsConfigured, environment } });
  return safe({ ...config.toObject(), gateway_id: gateway });
};
const validateField = (field, raw, environment) => {
  const value = String(raw);
  const rules = field.validation || {};
  if (rules.minLength !== undefined && value.length < rules.minLength) throw new ValidationError(rules.message || `${field.label} is too short`);
  if (rules.maxLength !== undefined && value.length > rules.maxLength) throw new ValidationError(rules.message || `${field.label} is too long`);
  const pattern = rules.environmentPatterns?.[environment] || rules.pattern;
  if (pattern && !(new RegExp(pattern).test(value))) throw new ValidationError(rules.message || `${field.label} is invalid`);
};
const normalizedCredentials = (gateway, row) => {
  const values = environmentValues(row);
  const source = { ...(values.credentials || {}), ...(values.configuration || {}) };
  const result = { ...source, config: row };
  for (const field of gateway.configurationFields || []) {
    const value = source[field.srmField];
    if (value === undefined) continue;
    result[field.providerField] = value;
    if (field.srmField === "keyId") result.keyId = value;
    if (field.srmField === "keySecret") result.keySecret = value;
    if (field.srmField === "webhookSecret") result.webhookSecret = value;
  }
  return result;
};
const createSandboxTestOrder = async (schoolId, actorId, code) => {
  const gateway = await Gateway.findOne({ code, isEnabled: true, integrationStatus: "implemented" }).lean();
  if (!gateway) throw new ConflictError("This payment provider is not available for sandbox testing");
  const config = await SchoolGateway.findOne({ school_id: schoolId, gateway_id: gateway._id, isEnabled: true, environment: "test", credentialsConfigured: true, configurationStatus: "READY", validationStatus: "VALID" }).lean();
  if (!config) throw new ConflictError("Enable the gateway in sandbox mode and validate its test credentials before running a test payment");
  const credentials = await loadCredentials(schoolId, gateway._id);
  const testId = crypto.randomUUID();
  const { createOrder } = require("./payment/PaymentProvider");
  const order = await createOrder({
    amountMinor: 100,
    receipt: `GWTEST-${testId.replace(/-/g, "").slice(0, 24)}`,
    credentials,
    notes: { gateway_health_check: "true", gateway_health_check_id: testId, school_id: String(schoolId), initiated_by: String(actorId || "") },
  });
  return { gateway: code, environment: "test", key_id: order.key_id, order_id: order.id, amount_minor: 100, currency: "INR", payment_methods: config.paymentMethods, test_id: testId };
};
const verifySandboxTestPayment = async (schoolId, actorId, code, payload = {}) => {
  const gateway = await Gateway.findOne({ code, isEnabled: true, integrationStatus: "implemented" }).lean();
  if (!gateway) throw new ConflictError("This payment provider is not available for sandbox testing");
  const config = await SchoolGateway.findOne({ school_id: schoolId, gateway_id: gateway._id, isEnabled: true, environment: "test", credentialsConfigured: true, configurationStatus: "READY", validationStatus: "VALID" }).lean();
  if (!config) throw new ConflictError("The gateway must remain enabled in sandbox mode to verify this test payment");
  const orderId = String(payload.razorpay_order_id || "");
  const paymentId = String(payload.razorpay_payment_id || "");
  const signature = String(payload.razorpay_signature || "");
  if (!orderId || !paymentId || !signature) throw new ValidationError("The sandbox payment response is incomplete");
  const credentials = await loadCredentials(schoolId, gateway._id);
  const provider = require("./payment/PaymentProvider");
  if (!provider.verifyCheckoutSignature({ orderId, paymentId, signature, keySecret: credentials.keySecret })) throw new ValidationError("The sandbox payment signature could not be verified");
  const [order, payment] = await Promise.all([provider.getOrder(orderId, credentials), provider.getPayment(paymentId, credentials)]);
  if (order.id !== orderId || order.notes?.gateway_health_check !== "true" || order.notes?.school_id !== String(schoolId) ||
      payment.order_id !== orderId || payment.id !== paymentId || payment.amount !== 100 || order.amount !== 100 ||
      payment.currency !== "INR" || payment.status !== "captured") {
    throw new ValidationError("The sandbox payment has not been captured or does not match this school test order");
  }
  await FeeAudit.create({ school_id: schoolId, actor_id: actorId, action: "GATEWAY_SANDBOX_TEST_PASSED", entity_type: "SchoolGateway", entity_id: config._id, details: { gateway: code, environment: "test", amount_minor: 100, provider_order_id: orderId, provider_payment_id: paymentId } });
  return { status: "PASSED", gateway: code, environment: "test", amount_minor: 100, currency: "INR", verified_at: new Date() };
};
const setEnabled = async (schoolId, actorId, code, enabled) => {
  const gateway = await Gateway.findOne({ code }).lean();
  if (!gateway) throw new NotFoundError("Payment gateway");
  const config = await SchoolGateway.findOne({ school_id: schoolId, gateway_id: gateway._id });
  if (!config) throw new NotFoundError("School payment gateway configuration");
  if (enabled && (!gateway.isEnabled || gateway.integrationStatus !== "implemented" || !config.credentialsConfigured || config.configurationStatus !== "READY" || config.validationStatus !== "VALID")) throw new ConflictError("This gateway must have validated credentials and be available before it can be enabled");
  config.isEnabled = enabled;
  config.updatedBy = actorId;
  await config.save();
  await FeeAudit.create({ school_id: schoolId, actor_id: actorId, action: enabled ? "SCHOOL_GATEWAY_ENABLED" : "SCHOOL_GATEWAY_DISABLED", entity_type: "SchoolGateway", entity_id: config._id, details: { gateway: code } });
  return safe({ ...config.toObject(), gateway_id: gateway });
};
const disconnect = async (schoolId, actorId, code) => {
  const gateway = await Gateway.findOne({ code }).lean();
  if (!gateway) throw new NotFoundError("Payment gateway");
  const config = await SchoolGateway.findOne({ school_id: schoolId, gateway_id: gateway._id });
  if (!config) throw new NotFoundError("School payment gateway configuration");
  config.isEnabled = false; config.configuration_encrypted = "";
  config.credentialsConfigured = false; config.configurationStatus = "DISCONNECTED"; config.validationStatus = "NOT_VALIDATED"; config.validationMessage = ""; config.updatedBy = actorId;
  await config.save();
  await FeeAudit.create({ school_id: schoolId, actor_id: actorId, action: "SCHOOL_GATEWAY_DISCONNECTED", entity_type: "SchoolGateway", entity_id: config._id, details: { gateway: code } });
  return safe({ ...config.toObject(), gateway_id: gateway });
};
const validate = async (schoolId, actorId, code) => {
  const gateway = await Gateway.findOne({ code }).lean();
  const config = gateway && await SchoolGateway.findOne({ school_id: schoolId, gateway_id: gateway._id });
  if (!config || !config.credentialsConfigured) throw new ConflictError("Configure merchant credentials before validation");
  try {
    if (gateway.code !== "razorpay" || gateway.integrationStatus !== "implemented") throw new ConflictError("Credential validation is not integrated for this provider");
    const credentials = normalizedCredentials(gateway, config);
    const expectedKeyPrefix = config.environment === "test" ? "rzp_test_" : "rzp_live_";
    if (!String(credentials.keyId || "").startsWith(expectedKeyPrefix)) throw new ValidationError(`Use a ${config.environment} Razorpay Key ID for this environment`);
    const { validateCredentials } = require("./payment/PaymentProvider");
    await validateCredentials({ keyId: credentials.keyId, keySecret: credentials.keySecret, environment: config.environment });
    config.validationStatus = "VALID"; config.configurationStatus = "READY"; config.validationMessage = "Credentials validated";
  } catch (error) {
    config.validationStatus = "INVALID"; config.configurationStatus = "VALIDATION_FAILED"; config.validationMessage = "Credential validation failed";
    await config.save();
    throw new ValidationError(error.message || "Credential validation failed");
  }
  config.lastValidatedAt = new Date(); config.updatedBy = actorId; await config.save();
  return safe({ ...config.toObject(), gateway_id: gateway });
};
const loadCredentials = async (schoolId, gatewayId, environment) => {
  const [gateway, config] = await Promise.all([
    Gateway.findById(gatewayId).lean(),
    SchoolGateway.findOne({ school_id: schoolId, gateway_id: gatewayId }).lean(),
  ]);
  if (!gateway || !config) throw new ValidationError("This school's payment credentials are not configured");
  const selectedEnvironment = environment || config.environment;
  const saved = environmentValues(config, selectedEnvironment);
  const values = { ...(saved.credentials || {}), ...(saved.configuration || {}) };
  const requiredFields = (gateway.configurationFields || []).filter((field) => field.required && (field.environmentApplicability || ["test", "live"]).includes(selectedEnvironment));
  if (!requiredFields.length || requiredFields.some((field) => !values[field.srmField] && !values[field.providerField])) {
    throw new ValidationError(`This school has no complete ${selectedEnvironment} credentials configured for this gateway`);
  }
  return normalizedCredentials(gateway, { ...config, environment: selectedEnvironment });
};
module.exports = { list, configure, setEnabled, disconnect, validate, createSandboxTestOrder, verifySandboxTestPayment, loadCredentials };
