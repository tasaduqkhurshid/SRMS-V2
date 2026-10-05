const { AsyncLocalStorage } = require('node:async_hooks');

const tenantStorage = new AsyncLocalStorage();

const runWithTenant = (school, next) => {
  tenantStorage.run(
    school ? { schoolId: String(school._id), slug: school.slug } : null,
    next,
  );
};

const getTenantContext = () => tenantStorage.getStore() || null;

module.exports = { runWithTenant, getTenantContext };