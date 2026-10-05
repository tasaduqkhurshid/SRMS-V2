"use strict";

const path = require("node:path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
dotenv.config();

const LEVELS = Object.freeze({ debug: 10, info: 20, warn: 30, error: 40 });
const requestedLevel = String(process.env.LOG_LEVEL || 'info').trim().toLowerCase();
const configuredLevel = Object.prototype.hasOwnProperty.call(LEVELS, requestedLevel)
  ? requestedLevel
  : 'info';
const threshold = LEVELS[configuredLevel];

const shouldLog = (level) => LEVELS[level] >= threshold;

const safeStringify = (v) => {
  try {
    return typeof v === 'string' ? v : JSON.stringify(v);
  } catch (e) {
    return String(v);
  }
};

const debug = (...args) => {
  if (!shouldLog('debug')) return;
  console.debug('[debug]', ...args.map(safeStringify));
};

const info = (...args) => {
  if (shouldLog('info')) console.info('[info]', ...args.map(safeStringify));
};
const warn = (...args) => {
  if (shouldLog('warn')) console.warn('[warn]', ...args.map(safeStringify));
};
const error = (...args) => {
  if (shouldLog('error')) console.error('[error]', ...args.map(safeStringify));
};

module.exports = { debug, info, warn, error, level: configuredLevel };
