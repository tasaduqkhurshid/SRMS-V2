"use strict";

const {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");

const config = require("../../config/r2Config");

let client;

class StorageNotConfiguredError extends Error {
  constructor() {
    super("Cloud storage is not configured");
    this.name = "StorageNotConfiguredError";
    this.code = "STORAGE_NOT_CONFIGURED";
    this.status = 503;
  }
}

class InvalidBucketTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidBucketTypeError";
    this.status = 500;
  }
}

const isConfigured = () => Boolean(config.enabled);

const getClient = () => {
  if (!config.enabled) {
    throw new StorageNotConfiguredError();
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return client;
};

const resolveBucketName = (bucketType) => {
  if (bucketType === "public") {
    if (!config.publicBucketName) {
      throw new InvalidBucketTypeError("Public storage bucket is not configured");
    }
    return config.publicBucketName;
  }

  if (bucketType === "private") {
    if (!config.privateBucketName) {
      throw new InvalidBucketTypeError("Private storage bucket is not configured");
    }
    return config.privateBucketName;
  }

  throw new InvalidBucketTypeError(`Invalid bucket type: ${bucketType}. Must be "public" or "private".`);
};

const validateKey = (key) => {
  if (
    typeof key !== "string" ||
    !key.startsWith("schools/") ||
    key.startsWith("/") ||
    key.includes("..") ||
    key.includes("\\") ||
    key.split("/").some((segment) => !segment)
  ) {
    throw new Error("Invalid storage key");
  }

  return key;
};

const createUploadKey = ({ schoolSlug, category, filename, extension }) => {
  const slug = String(schoolSlug || "")
    .trim()
    .toLowerCase();

  const allowedCategories = new Set([
    "branding",
    "students",
    "documents",
    "fees",
    "results",
    "certificates",
    "videos",
  ]);

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !allowedCategories.has(category)
  ) {
    throw new Error("Invalid school storage location");
  }

  const safeFilename = String(filename || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 80);

  const safeExtension = String(extension || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (!safeFilename || !safeExtension) {
    throw new Error("Invalid storage filename");
  }

  return `schools/${slug}/${category}/${safeFilename}.${safeExtension}`;
};

const uploadFile = async ({
  bucketType = "private",
  key,
  body,
  contentType,
  cacheControl,
}) => {
  if (!Buffer.isBuffer(body) || !body.length) {
    throw new Error("File body is required");
  }

  const bucket = resolveBucketName(bucketType);
  const validatedKey = validateKey(key);

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: validatedKey,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl || (bucketType === "public" ? "public, max-age=3600" : "private, max-age=300"),
    }),
  );

  return validatedKey;
};

const deleteFile = async (key, bucketType = "private") => {
  const bucket = resolveBucketName(bucketType);

  await getClient().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: validateKey(key),
    }),
  );
};

const getFile = async (key, bucketType = "private") => {
  const bucket = resolveBucketName(bucketType);

  const result = await getClient().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: validateKey(key),
    }),
  );

  const body = result.Body;

  if (!body) {
    throw new Error("Storage returned an empty response body");
  }

  let bytes;

  if (typeof body.transformToByteArray === "function") {
    bytes = Buffer.from(await body.transformToByteArray());
  } else {
    bytes = await new Promise((resolve, reject) => {
      const chunks = [];

      body.on("data", (chunk) => {
        chunks.push(Buffer.from(chunk));
      });

      body.on("error", reject);

      body.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  return {
    body: bytes,
    contentType: result.ContentType || "application/octet-stream",
    cacheControl: result.CacheControl,
  };
};

// Branding-specific operations - uses public bucket for new uploads, falls back to private for legacy
const uploadBrandingAsset = async ({
  schoolSlug,
  asset,
  body,
  contentType,
  extension,
}) => {
  const bucketName = resolveBucketName("public");

  const key = createUploadKey({
    schoolSlug,
    category: "branding",
    filename: `${asset}-${require("node:crypto").randomUUID()}`,
    extension,
  });

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=3600",
    }),
  );

  return { key, bucketName };
};

const getBrandingAsset = async (key) => {
  // Try public bucket first (new uploads)
  if (config.publicBucketName) {
    try {
      return await getFile(key, "public");
    } catch (publicError) {
      // Only fall back to private bucket on genuine 404/NotFound
      const isNotFound =
        publicError.name === "NoSuchKey" ||
        publicError.name === "NotFound" ||
        publicError.status === 404;
      if (!isNotFound) {
        throw publicError;
      }
    }
  }

  // Fall back to private bucket for legacy records
  return await getFile(key, "private");
};

const deleteBrandingAsset = async (key) => {
  // Delete from public bucket (new location)
  if (config.publicBucketName) {
    await deleteFile(key, "public").catch((err) => {
      // Log but don't throw for cleanup
    });
  }
  // Also try private bucket for legacy compatibility
  await deleteFile(key, "private").catch((err) => {
    // Log but don't throw for cleanup
  });
};

const getPublicUrl = (key) => {
  if (!config.publicBucketName || !config.publicBaseUrl) {
    return null;
  }

  const validatedKey = validateKey(key);

  return `${config.publicBaseUrl}/${validatedKey
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
};

module.exports = {
  isConfigured,
  getClient,
  resolveBucketName,
  createUploadKey,
  uploadFile,
  deleteFile,
  getFile,
  getPublicUrl,
  // Branding-specific operations
  uploadBrandingAsset,
  getBrandingAsset,
  deleteBrandingAsset,
  StorageNotConfiguredError,
  InvalidBucketTypeError,
};