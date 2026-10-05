"use strict";

const { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const config = require('../../config/r2Config');

let client;

class StorageNotConfiguredError extends Error {
  constructor() {
    super('Cloud storage is not configured');
    this.name = 'StorageNotConfiguredError';
    this.code = 'STORAGE_NOT_CONFIGURED';
    this.status = 503;
  }
}

const isConfigured = () => config.enabled;

const getClient = () => {
  if (!config.enabled) throw new StorageNotConfiguredError();
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }
  return client;
};

const validateKey = (key) => {
  if (typeof key !== 'string' || !key.startsWith('schools/') || key.includes('..') || key.startsWith('/')) {
    throw new Error('Invalid storage key');
  }
  return key;
};

const createUploadKey = ({ schoolSlug, category, filename, extension }) => {
  const slug = String(schoolSlug || '').trim().toLowerCase();
  const allowedCategories = new Set(['branding', 'students', 'documents', 'fees', 'results', 'certificates', 'videos']);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !allowedCategories.has(category)) {
    throw new Error('Invalid school storage location');
  }
  const safeFilename = String(filename || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  const safeExtension = String(extension || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!safeFilename || !safeExtension) throw new Error('Invalid storage filename');
  return `schools/${slug}/${category}/${safeFilename}.${safeExtension}`;
};

const uploadFile = async ({ key, body, contentType, cacheControl }) => {
  if (!Buffer.isBuffer(body) || !body.length) throw new Error('File body is required');
  await getClient().send(new PutObjectCommand({
    Bucket: config.bucketName,
    Key: validateKey(key),
    Body: body,
    ContentType: contentType,
    CacheControl: cacheControl || 'private, max-age=300',
  }));
  return key;
};

const deleteFile = async (key) => {
  await getClient().send(new DeleteObjectCommand({ Bucket: config.bucketName, Key: validateKey(key) }));
};

const getFile = async (key) => {
  const result = await getClient().send(new GetObjectCommand({ Bucket: config.bucketName, Key: validateKey(key) }));
  const body = result.Body;
  const bytes = typeof body?.transformToByteArray === 'function'
    ? Buffer.from(await body.transformToByteArray())
    : await new Promise((resolve, reject) => {
      const chunks = [];
      body.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      body.on('error', reject);
      body.on('end', () => resolve(Buffer.concat(chunks)));
    });
  return { body: bytes, contentType: result.ContentType || 'application/octet-stream', cacheControl: result.CacheControl };
};

const getPublicUrl = (key) => {
  if (!config.publicBaseUrl) return null;
  return `${config.publicBaseUrl}/${validateKey(key).split('/').map(encodeURIComponent).join('/')}`;
};

module.exports = {
  isConfigured,
  getClient,
  createUploadKey,
  uploadFile,
  deleteFile,
  getFile,
  getPublicUrl,
  StorageNotConfiguredError,
};
