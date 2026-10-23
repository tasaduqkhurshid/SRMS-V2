"use strict";

const crypto = require("node:crypto");
const { ValidationError } = require("../../utils/applicationErrors");
const endpoint = "https://api.razorpay.com/v1";
const authHeader = (credentials) => `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString("base64")}`;
const request = async (path, credentials, options = {}) => {
  let response;
  try { response = await fetch(`${endpoint}${path}`, { ...options, headers: { Authorization: authHeader(credentials), ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) } }); }
  catch { throw new Error("The payment provider could not be reached"); }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("The payment provider rejected the request");
  return result;
};
const validateCredentials = async (credentials) => {
  const result = await request("/orders?count=1", credentials);
  if (!Array.isArray(result.items)) throw new ValidationError("The provider returned an unexpected credential validation response");
  return true;
};
const createOrder = async ({ amountMinor, receipt, notes = {}, credentials }) => {
  if (!credentials?.keyId || !credentials?.keySecret) throw new ValidationError("School payment credentials are not configured");
  const result = await request("/orders", credentials, { method: "POST", body: JSON.stringify({ amount: amountMinor, currency: "INR", receipt: String(receipt).slice(0, 40), notes, expire_by: Math.floor(Date.now() / 1000) + 3600 }) });
  if (!result.id) throw new Error("The payment provider could not create the payment order");
  return { id: result.id, amount: result.amount, currency: result.currency, expire_by: result.expire_by, key_id: credentials.keyId };
};
const getOrder = (orderId, credentials) => request(`/orders/${encodeURIComponent(orderId)}`, credentials);
const getPayment = (paymentId, credentials) => request(`/payments/${encodeURIComponent(paymentId)}`, credentials);
const verifyCheckoutSignature = ({ orderId, paymentId, signature, keySecret }) => {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest();
  let received;
  try { received = Buffer.from(String(signature), "hex"); } catch { return false; }
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};
const getOrderPayments = async (orderId, credentials) => {
  const result = await request(`/orders/${encodeURIComponent(orderId)}/payments`, credentials);
  if (!Array.isArray(result.items)) throw new Error("The payment provider could not verify this transaction");
  return result.items;
};
const createRefund = async ({ paymentId, amountMinor, receipt, notes = {}, credentials }) => {
  const result = await request(`/payments/${encodeURIComponent(paymentId)}/refund`, credentials, { method: "POST", body: JSON.stringify({ amount: amountMinor, receipt: String(receipt).slice(0, 40), notes }) });
  if (!result.id) throw new Error("The payment provider could not create this refund");
  return { id: result.id, payment_id: result.payment_id, amount: result.amount, status: result.status };
};
const getPaymentRefunds = async (paymentId, credentials) => {
  const result = await request(`/payments/${encodeURIComponent(paymentId)}/refunds`, credentials);
  if (!Array.isArray(result.items)) throw new Error("The payment provider could not verify this refund");
  return result.items;
};
const verifyWebhook = (rawBody, signature, secret) => {
  if (!Buffer.isBuffer(rawBody) || !signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest();
  let received;
  try { received = Buffer.from(String(signature), "hex"); } catch { return false; }
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};
const isOrderSafelyExpired = (order, payments = []) => String(order?.status || "").toLowerCase() === "expired" && !payments.some((payment) => ["authorized", "captured"].includes(String(payment?.status || "").toLowerCase()));
module.exports = { validateCredentials, createOrder, getOrder, getPayment, getOrderPayments, createRefund, getPaymentRefunds, verifyCheckoutSignature, verifyWebhook, isOrderSafelyExpired };
