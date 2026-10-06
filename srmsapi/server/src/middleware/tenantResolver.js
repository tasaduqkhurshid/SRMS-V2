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
  ['/students', '/subjects', '/courses', '/exams', '/academic-years', '/results', '/marksheet-templates', '/school', '/auth', '/options']
    .some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const requirePlatformHost = (req, res, next) =>
  req.isPlatformHost
    ? next()
    : res.status(404).json({ status: 'error', message: 'Platform portal not found on this hostname' });

const resolveTenant = async (req, res, next) => {
  const host = req.get('host') || req.get('x-forwarded-host');
  const hostname = normalizeHost(host);
  const rootDomain = normalizeHost(process.env.ROOT_DOMAIN || 'srms.local').replace(/^\.+|\.+$/g, '');
  if (hostname === `admin.${rootDomain}`) {
    req.isPlatformHost = true;
    return runWithTenant(null, next);
  }
  const slug = slugFromHostname(host);
  const required = tenantRequiredForPath(req.path) && req.path !== '/api/health';

  if (!slug) {
    const defaultSlug = process.env.DEFAULT_TENANT_SLUG;
    if (defaultSlug) {
      try {
        const school = await School.findOne({ slug: defaultSlug, status: 'active' }).lean();
        if (school) {
          req.school = school;
          req.schoolId = school._id;
          return runWithTenant(school, next);
        }
      } catch (error) {
        return next(error);
      }
    }
    if (required) return res.status(400).json({ status: 'error', message: 'Use a school-specific hostname' });
    return runWithTenant(null, next);
  }

  try {
    const school = await School.findOne({ slug }).lean();
    if (!school || school.status === 'inactive') {
      if (required) return res.status(school?.status === 'inactive' ? 403 : 404).json({ status: 'error', message: school?.status === 'inactive' ? 'School is inactive' : 'School hostname not found' });
      return runWithTenant(null, next);
    }
    req.school = school;
    req.schoolId = school._id;
    return runWithTenant(school, next);
  } catch (error) {
    return next(error);
  }
};

module.exports = { resolveTenant, requirePlatformHost, slugFromHostname, tenantRequiredForPath };