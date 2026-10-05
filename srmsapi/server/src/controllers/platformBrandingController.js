"use strict";

const { randomUUID } = require('node:crypto');
const { School } = require('../db/models');
const storage = require('../services/storage/storage.service');
const logger = require('../utils/logger');

const MIME_TO_EXTENSION = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

const hasValidImageSignature = (buffer, mimeType) => {
  if (!Buffer.isBuffer(buffer)) return false;
  if (mimeType === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === 'image/png') return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === 'image/webp') return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return false;
};

const assetConfig = (asset) => {
  if (asset === 'logo') return { field: 'logoKey', base: 'logo' };
  if (asset === 'welcome-image') return { field: 'welcomeImageKey', base: 'welcome' };
  return null;
};

const uploadBranding = async (req, res) => {
  const config = assetConfig(req.params.asset);
  if (!config) return res.status(404).json({ success: false, message: 'Branding asset not found' });
  if (!req.isPlatformHost || String(req.user?.role).toUpperCase() !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Super Admin access required' });
  }
  if (!storage.isConfigured()) {
    return res.status(503).json({ success: false, message: 'Cloud storage is not configured' });
  }
  if (!req.file) return res.status(400).json({ success: false, message: 'Choose an image to upload' });

  const extension = MIME_TO_EXTENSION.get(String(req.file.mimetype || '').toLowerCase());
  const clientExtension = String(req.file.originalname || '').split('.').pop().toLowerCase();
  const allowedExtensions = extension === 'jpg' ? ['jpg', 'jpeg'] : [extension];
  if (!extension || !allowedExtensions.includes(clientExtension) || !hasValidImageSignature(req.file.buffer, req.file.mimetype)) {
    return res.status(400).json({ success: false, message: 'Use a valid JPEG, PNG, or WebP image' });
  }

  try {
    const school = await School.findById(req.params.schoolId).lean();
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    const key = storage.createUploadKey({
      schoolSlug: school.slug,
      category: 'branding',
      filename: `${config.base}-${randomUUID()}`,
      extension,
    });
    await storage.uploadFile({ key, body: req.file.buffer, contentType: req.file.mimetype, cacheControl: 'public, max-age=300' });

    try {
      await School.updateOne({ _id: school._id }, { $set: { [`branding.${config.field}`]: key } });
    } catch (error) {
      await storage.deleteFile(key).catch(() => {});
      throw error;
    }

    const previousKey = school.branding?.[config.field];
    if (previousKey && previousKey !== key) {
      await storage.deleteFile(previousKey).catch((error) => {
        logger.warn('Unable to remove replaced branding object');
      });
    }

    return res.json({
      success: true,
      data: { asset: req.params.asset, url: `/api/student/school/branding/${req.params.asset}` },
    });
  } catch (error) {
    logger.error('School branding upload failed:', error.message);
    const status = error.status || 502;
    return res.status(status).json({ success: false, message: status === 503 ? 'Cloud storage is not configured' : 'Unable to upload school branding image' });
  }
};

const getBrandingAsset = async (req, res) => {
  const config = assetConfig(req.params.asset);
  if (!config || !req.school) return res.status(404).json({ success: false, message: 'Branding image not found' });
  const key = req.school.branding?.[config.field];
  if (!key) return res.status(404).json({ success: false, message: 'Branding image not found' });
  if (!storage.isConfigured()) return res.status(503).json({ success: false, message: 'Cloud storage is not configured' });

  try {
    const object = await storage.getFile(key);
    const contentType = MIME_TO_EXTENSION.has(object.contentType) ? object.contentType : 'application/octet-stream';
    if (contentType === 'application/octet-stream') return res.status(502).json({ success: false, message: 'Invalid branding image content type' });
    res.set({
      'Content-Type': contentType,
      'Content-Length': String(object.body.length),
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(200).send(object.body);
  } catch (error) {
    const status = error.status || (error.name === 'NoSuchKey' || error.name === 'NotFound' ? 404 : 502);
    if (status !== 404) logger.error('School branding image retrieval failed:', error.message);
    return res.status(status).json({ success: false, message: status === 503 ? 'Cloud storage is not configured' : status === 404 ? 'Branding image not found' : 'Unable to load school branding image' });
  }
};

module.exports = { uploadBranding, getBrandingAsset, MIME_TO_EXTENSION };
