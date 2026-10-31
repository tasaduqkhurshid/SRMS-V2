const { School } = require('../db/models');
const { runWithTenant } = require('./tenantContext');

const normalizeHost = (value) => String(value || '').trim().toLowerCase().split(',')[0].split(':')[0];

const slugFromHostname = (host, rootDomain = process.env.ROOT_DOMAIN || 'srms.local') => {
  const hostname = normalizeHost(host);
  const domain = normalizeHost(rootDomain).replace(/^\.+|\.+$/g, '');
  if (!hostname || !domain || !hostname.endsWith(`.${domain}`)) return null;
  const slug = hostname.slice(0, -(domain.length + 1));
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null;
};

const tenantRequiredForPath = (path) =>
  path.startsWith('/api/') ||
  ['/students', '/subjects', '/courses', '/exams', '/academic-years', '/results', '/marksheet-templates', '/school', '/auth', '/options', '/admin']
    .some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const requirePlatformHost = (req, res, next) =>
  req.isPlatformHost
    ? next()
    : res.status(404).json({ status: 'error', message: 'Platform portal not found on this hostname' });

const resolveTenant = async (req, res, next) => {
  const host = req.get('host') || req.get('x-forwarded-host');
  const hostname = normalizeHost(host);
  const rootDomain = normalizeHost(process.env.ROOT_DOMAIN || 'srms.local').replace(/^\.+|\.+$/g, '');
  console.log('[tenantResolver] host:', host, 'hostname:', hostname, 'rootDomain:', rootDomain);
  if (hostname === `admin.${rootDomain}`) {
    req.isPlatformHost = true;
    console.log('[tenantResolver] platform host');
    return runWithTenant(null, next);
  }
  const slug = slugFromHostname(host);
  const required = tenantRequiredForPath(req.path) && req.path !== '/api/health';
  console.log('[tenantResolver] slug:', slug, 'required:', required, 'path:', req.path);

  const findSchoolBySlug = async (s) => {
    const school = await School.findOne({ slug: s }).lean(); // Don't filter by status here
    if (!school) return null;
    if (school.status === 'inactive') {
      if (required) return res.status(403).json({ status: 'error', message: 'School is inactive' });
      return null;
    }
    req.school = school;
    req.schoolId = school._id;
    return school;
  };

  // If we got a valid slug from hostname, try to find that specific school
  if (slug) {
    const school = await findSchoolBySlug(slug);
    console.log('[tenantResolver] found school:', school ? school.slug : null);
    if (res.headersSent) return; // Response already sent (e.g. school inactive)
    if (school) return runWithTenant(school, next);
    // School not found for this slug (or was inactive but required=false)
    if (required) return res.status(404).json({ status: 'error', message: 'School hostname not found' });
    return runWithTenant(null, next);
  }

  // No slug from hostname (e.g. localhost) - fallback to DEFAULT_TENANT_SLUG
  const defaultSlug = process.env.DEFAULT_TENANT_SLUG;
  if (defaultSlug) {
    try {
      const school = await findSchoolBySlug(defaultSlug);
      if (res.headersSent) return;
      if (school) return runWithTenant(school, next);
    } catch (error) {
      return next(error);
    }
  }

  if (required) return res.status(400).json({ status: 'error', message: 'Use a school-specific hostname' });
  return runWithTenant(null, next);
};

module.exports = { resolveTenant, requirePlatformHost, slugFromHostname, tenantRequiredForPath };