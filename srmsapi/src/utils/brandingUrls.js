"use strict";

const brandingAssetUrl = (school, asset) => {
  const field = asset === "logo" ? "logoKey" : asset === "welcome-image" ? "welcomeImageKey" : null;
  const key = field && school?.branding?.[field];
  if (!key) return "";
  return `/api/student/school/branding/${asset}?v=${encodeURIComponent(key)}`;
};

module.exports = { brandingAssetUrl };
