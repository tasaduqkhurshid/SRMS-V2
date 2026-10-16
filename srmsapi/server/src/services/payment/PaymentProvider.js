"use strict";

const crypto = require("node:crypto");
const { ValidationError } = require("../../utils/applicationErrors");

const isConfigured = () => Boolean(
  process.env.PAYMENT_GATEWAY_PROVIDER === "razorpay" &&
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET,
);

const createOrder = async ({ amountMinor, receipt, notes = {} }) => {
  if (!isConfigured()) throw new ValidationError("Online payments are not configured for this server");
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  let response;
  try {
    response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountMinor, currency: "INR", receipt: String(receipt).slice(0, 40), notes, expire_by: Math.floor(Date.now() / 1000) + 3600 }),
    });
  } catch (error) {
    throw new Error("The payment provider could not be reached");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.id) throw new Error("The payment provider could not create the payment order");
  return { id: result.id, amount: result.amount, currency: result.currency, expire_by: result.expire_by, key_id: process.env.RAZORPAY_KEY_ID };
};

const getOrder = async (orderId) => {
  if (!isConfigured()) throw new ValidationError("Online payments are not configured for this server");
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  let response;
  try {
    response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
  } catch {
    throw new Error("The payment provider could not be reached to verify this transaction");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.id) throw new Error("The payment provider could not verify this order");
  return result;
};

const getOrderPayments = async (orderId) => {
  if (!isConfigured()) throw new ValidationError("Online payments are not configured for this server");
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  let response;
  try {
    response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}/payments`, {
      headers: { Authorization: `Basic ${auth}` },
    });
  } catch {
    throw new Error("The payment provider could not be reached to verify this transaction");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(result.items)) throw new Error("The payment provider could not verify this transaction");
  return result.items;
};

const createRefund = async ({ paymentId, amountMinor, receipt, notes = {} }) => {
  if (!isConfigured()) throw new ValidationError("Online payments are not configured for this server");
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  let response;
  try {
    response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountMinor, receipt: String(receipt).slice(0, 40), notes }),
    });
  } catch {
    throw new Error("The payment provider could not be reached to request this refund");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.id) {
    const error = new Error("The payment provider could not create this refund");
    error.providerRejected = response.status >= 400 && response.status < 500;
    throw error;
  }
  return { id: result.id, payment_id: result.payment_id, amount: result.amount, status: result.status };
};

const getPaymentRefunds = async (paymentId) => {
  if (!isConfigured()) throw new ValidationError("Online payments are not configured for this server");
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  let response;
  try {
    response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refunds`, {
      headers: { Authorization: `Basic ${auth}` },
    });
  } catch {
    throw new Error("The payment provider could not be reached to verify this refund");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(result.items)) throw new Error("The payment provider could not verify this refund");
  return result.items;
};

const verifyWebhook = (rawBody, signature) => {
  if (!isConfigured() || !Buffer.isBuffer(rawBody) || !signature) return false;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest();
  let received;
  try { received = Buffer.from(String(signature), "hex"); } catch { return false; }
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};

const isOrderSafelyExpired = (order, payments = []) =>
  String(order?.status || "").toLowerCase() === "expired" &&
  !payments.some((payment) => ["authorized", "captured"].includes(String(payment?.status || "").toLowerCase()));

module.exports = { isConfigured, createOrder, getOrder, getOrderPayments, createRefund, getPaymentRefunds, verifyWebhook, isOrderSafelyExpired };
