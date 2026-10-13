/**
 * Centralized URL utility for SRMS V2 portal URLs.
 * Derives portal URLs from configuration and current window location.
 * Works for both local development (sms.local) and production deployments.
 */

// Configuration defaults - can be overridden via setPortalConfig()
let portalConfig = {
  rootDomain: null,        // Auto-detected if null
  protocol: null,          // Auto-detected if null
  port: null,              // Auto-detected if null
  adminPath: '/admin/',    // School admin portal path prefix
  studentPath: '/',        // Student portal path prefix
};

/**
 * Configure the portal URL generator.
 * Call this during app initialization if auto-detection isn't sufficient.
 * @param {Object} config
 * @param {string} [config.rootDomain] - Root domain (e.g., 'sms.local', 'example.com')
 * @param {string} [config.protocol] - Protocol ('http:' or 'https:')
 * @param {string} [config.port] - Port number as string (e.g., '8080')
 * @param {string} [config.adminPath='/admin/'] - School admin portal path
 * @param {string} [config.studentPath='/'] - Student portal path
 */
export function setPortalConfig(config) {
  portalConfig = { ...portalConfig, ...config };
}

/**
 * Get the effective root domain.
 * @param {string} [hostname] - Optional hostname override
 * @returns {string} Root domain (e.g., 'sms.local', 'example.com')
 */
export function getRootDomain(hostname) {
  if (portalConfig.rootDomain) {
    return portalConfig.rootDomain;
  }

  const locationHostname = hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  if (!locationHostname) {
    throw new Error('Cannot determine root domain: no hostname available and no configured rootDomain');
  }

  const rootDomain = locationHostname.replace(/^admin\./, '');
  // For local development, map localhost variants to sms.local
  return ['localhost', '127.0.0.1', ''].includes(rootDomain) ? 'sms.local' : rootDomain;
}

/**
 * Get the effective protocol.
 * @returns {string} Protocol with colon (e.g., 'http:', 'https:')
 */
export function getProtocol() {
  if (portalConfig.protocol) {
    return portalConfig.protocol.endsWith(':') ? portalConfig.protocol : `${portalConfig.protocol}:`;
  }
  if (typeof window !== 'undefined') {
    return window.location.protocol;
  }
  return 'http:';
}

/**
 * Get the effective port suffix.
 * @returns {string} Port suffix (e.g., ':8080' or '')
 */
export function getPortSuffix() {
  if (portalConfig.port) {
    return `:${portalConfig.port}`;
  }
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    // Omit standard ports
    if (port && port !== '80' && port !== '443') {
      return `:${port}`;
    }
  }
  return '';
}

/**
 * Get the effective admin path.
 * @returns {string} Admin path (e.g., '/admin/')
 */
export function getAdminPath() {
  return portalConfig.adminPath || '/admin/';
}

/**
 * Get the effective student path.
 * @returns {string} Student path (e.g., '/')
 */
export function getStudentPath() {
  return portalConfig.studentPath || '/';
}

/**
 * Build a portal URL for a given school slug.
 * @param {Object} options
 * @param {string} options.schoolSlug - The school's slug
 * @param {string} [options.path] - Path to append (overrides default based on portal type)
 * @param {boolean} [options.isAdmin] - Whether this is an admin portal URL
 * @returns {string} The full portal URL
 * @throws {Error} If schoolSlug is missing or invalid
 */
export function buildPortalUrl({ schoolSlug, path, isAdmin } = {}) {
  if (!schoolSlug || typeof schoolSlug !== 'string' || !schoolSlug.trim()) {
    throw new Error('schoolSlug is required to build portal URL');
  }

  const protocol = getProtocol();
  const rootDomain = getRootDomain();
  const portSuffix = getPortSuffix();
  const basePath = isAdmin ? getAdminPath() : getStudentPath();
  const finalPath = path !== undefined ? path : basePath;

  return `${protocol}//${schoolSlug}.${rootDomain}${portSuffix}${finalPath}`;
}

/**
 * Get the school admin portal URL for a school.
 * @param {Object} school - School object with slug property
 * @param {string} [path] - Optional path override (default: adminPath)
 * @returns {string|null} School admin portal URL or null if slug missing
 */
export function getSchoolAdminUrl(school, path) {
  if (!school?.slug) return null;
  try {
    return buildPortalUrl({ schoolSlug: school.slug, path, isAdmin: true });
  } catch {
    return null;
  }
}

/**
 * Get the student portal URL for a school.
 * @param {Object} school - School object with slug property
 * @param {string} [path] - Optional path override (default: studentPath)
 * @returns {string|null} Student portal URL or null if slug missing
 */
export function getStudentPortalUrl(school, path) {
  if (!school?.slug) return null;
  try {
    return buildPortalUrl({ schoolSlug: school.slug, path, isAdmin: false });
  } catch {
    return null;
  }
}

/**
 * Get both portal URLs for a school.
 * @param {Object} school - School object with slug property
 * @returns {Object} Object with schoolAdminUrl and studentPortalUrl (null if slug missing)
 */
export function getPortalUrls(school) {
  return {
    schoolAdminUrl: getSchoolAdminUrl(school),
    studentPortalUrl: getStudentPortalUrl(school),
  };
}

/**
 * Copy text to clipboard with fallback for older browsers.
 * Reports failure via returned Promise rejection.
 * @param {string} text - Text to copy
 * @returns {Promise<void>} Resolves on success, rejects on failure
 */
export async function copyToClipboard(text) {
  if (!text) {
    throw new Error('No text provided to copy');
  }

  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for insecure contexts or older browsers
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        resolve();
      } else {
        reject(new Error('Copy command failed'));
      }
    } catch (error) {
      reject(error);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

/**
 * Open URL in a new tab safely with noopener/noreferrer.
 * @param {string} url - URL to open
 * @returns {boolean} True if opened, false if invalid URL
 */
export function openInNewTab(url) {
  if (!url) return false;
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  }
}

/**
 * Auto-detect and configure from current window location.
 * Useful for local development without explicit config.
 * @returns {Object} The applied configuration
 */
export function autoConfigureFromWindow() {
  if (typeof window === 'undefined') return portalConfig;

  const hostname = window.location.hostname;
  const isLocalhost = ['localhost', '127.0.0.1'].includes(hostname);

  // For local development, use sms.local as root domain
  const rootDomain = isLocalhost ? 'sms.local' : hostname.replace(/^admin\./, '');

  portalConfig = {
    ...portalConfig,
    rootDomain: portalConfig.rootDomain || rootDomain,
    protocol: portalConfig.protocol || window.location.protocol,
    port: portalConfig.port || (['80', '443', ''].includes(window.location.port) ? null : window.location.port),
  };

  return portalConfig;
}

/**
 * Reset configuration to defaults (mainly for testing).
 */
export function resetPortalConfig() {
  portalConfig = {
    rootDomain: null,
    protocol: null,
    port: null,
    adminPath: '/admin/',
    studentPath: '/',
  };
}

export default {
  setPortalConfig,
  getRootDomain,
  getProtocol,
  getPortSuffix,
  getAdminPath,
  getStudentPath,
  buildPortalUrl,
  getSchoolAdminUrl,
  getStudentPortalUrl,
  getPortalUrls,
  copyToClipboard,
  openInNewTab,
  autoConfigureFromWindow,
  resetPortalConfig,
};