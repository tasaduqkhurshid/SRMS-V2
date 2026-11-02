"use strict";

const path = require("node:path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../../..", ".env") });
dotenv.config();

const getDatabaseConfig = () => {
  const type = String(process.env.DB_TYPE || "docker").trim().toLowerCase();
  if (!['docker', 'local'].includes(type)) {
    throw new Error(`Invalid DB_TYPE "${type}". Use "docker" or "local".`);
  }

  const inApiContainer = String(process.env.SMS_API_IN_DOCKER || "false").toLowerCase() === "true";
  const defaultHost = type === 'docker'
    ? 'mongodb'
    : inApiContainer ? 'host.docker.internal' : '127.0.0.1';
  let host = String(process.env.DB_HOST || defaultHost).trim();
  // A loopback address inside the API container points back to that container.
  if (type === 'local' && inApiContainer && ['127.0.0.1', 'localhost'].includes(host)) {
    host = 'host.docker.internal';
  }

  const port = Number(process.env.DB_PORT || 27017);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535');
  }

  const name = String(process.env.DB_NAME || 'school-system').trim();
  if (!name) throw new Error('DB_NAME is required');

  const username = String(process.env.DB_USERNAME || '').trim();
  const password = String(process.env.DB_PASSWORD || '');
  if (Boolean(username) !== Boolean(password)) {
    throw new Error('Set both DB_USERNAME and DB_PASSWORD, or leave both empty for an unauthenticated MongoDB');
  }

  const authSource = String(process.env.DB_AUTH_SOURCE || 'admin').trim();
  if (username && !authSource) throw new Error('DB_AUTH_SOURCE is required when MongoDB authentication is enabled');
  // Respect an explicit empty value for standalone MongoDB. If unset, the
  // root Compose stack's Docker MongoDB uses rs0; host mode defaults to none.
  const replicaSet = process.env.DB_REPLICA_SET !== undefined
    ? String(process.env.DB_REPLICA_SET).trim()
    : type === 'docker' ? 'rs0' : '';
  const directConnectionRaw = String(process.env.DB_DIRECT_CONNECTION || "false").trim().toLowerCase();
  if (!["true", "false"].includes(directConnectionRaw)) {
    throw new Error('DB_DIRECT_CONNECTION must be "true" or "false"');
  }
  const directConnection = directConnectionRaw === "true";
  if (directConnection && replicaSet) {
    throw new Error("DB_DIRECT_CONNECTION=true cannot be combined with DB_REPLICA_SET; set DB_REPLICA_SET empty for a direct host connection");
  }
  const credentials = username
    ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
    : '';
  const safeHost = host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
  const queryParams = new URLSearchParams();
  if (username) queryParams.set('authSource', authSource);
  if (replicaSet) queryParams.set('replicaSet', replicaSet);
  if (directConnection) queryParams.set('directConnection', 'true');
  const authQuery = queryParams.size ? `?${queryParams.toString()}` : '';
  const uri = `mongodb://${credentials}${safeHost}:${port}/${encodeURIComponent(name)}${authQuery}`;

  return Object.freeze({
    type,
    host,
    port,
    name,
    username,
    password,
    authSource,
    replicaSet,
    directConnection,
    uri,
    summary: { type, host, port, database: name },
  });
};

module.exports = { getDatabaseConfig };
