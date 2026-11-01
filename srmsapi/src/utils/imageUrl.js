"use strict";

const config = require("../config/r2Config");

const constructImageUrl = (bucketType, imageKey) => {
  if (!imageKey) return "";

  const validatedKey = String(imageKey).trim();
  if (!validatedKey) return "";

  if (bucketType === "public") {
    if (!config.enabled || !config.publicBaseUrl || !config.publicBucketName) {
      return "";
    }
    return `${config.publicBaseUrl}/${validatedKey
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
  }

  if (bucketType === "private") {
    // Private images served through API proxy endpoint
    // The API fetches from private bucket and streams to client
    return `/api/student/school/branding/logo?v=${encodeURIComponent(validatedKey)}`;
  }

  return "";
};

const getPublicImageUrl = (imageKey) => constructImageUrl("public", imageKey);
const getPrivateImageUrl = (imageKey) => constructImageUrl("private", imageKey);

module.exports = {
  constructImageUrl,
  getPublicImageUrl,
  getPrivateImageUrl,
};