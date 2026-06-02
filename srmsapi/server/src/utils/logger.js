"use strict";
// Lightweight logger wrapper. Use process.env.DEBUG=true to enable debug logs.
const isDebug = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production';

const safeStringify = (v) => {
  try {
    return typeof v === 'string' ? v : JSON.stringify(v);
  } catch (e) {
    return String(v);
  }
};

const debug = (...args) => {
  if (!isDebug) return;
  console.debug('[debug]', ...args.map(safeStringify));
};

const info = (...args) => console.info('[info]', ...args.map(safeStringify));
const warn = (...args) => console.warn('[warn]', ...args.map(safeStringify));
const error = (...args) => console.error('[error]', ...args.map(safeStringify));

module.exports = { debug, info, warn, error };
