const { getTenantContext } = require('./tenantContext');

const queryOperations = [
  'find', 'findOne', 'countDocuments', 'distinct', 'updateOne', 'updateMany',
  'findOneAndUpdate', 'replaceOne', 'deleteOne', 'deleteMany', 'findOneAndDelete',
];

const tenantScopePlugin = (schema) => {
  if (!schema.path('school_id')) return;

  schema.pre(queryOperations, function applyTenantScope(next) {
    const tenant = getTenantContext();
    if (!tenant?.schoolId) return next();

    this.where({ school_id: tenant.schoolId });
    if (['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne'].includes(this.op)) {
      this.set({ school_id: tenant.schoolId });
    }
    next();
  });

  schema.pre('aggregate', function applyAggregateTenantScope(next) {
    const tenant = getTenantContext();
    if (tenant?.schoolId) this.pipeline().unshift({ $match: { school_id: tenant.schoolId } });
    next();
  });

  schema.pre('save', function applyDocumentTenantScope(next) {
    const tenant = getTenantContext();
    if (!tenant?.schoolId) return next();
    if (this.school_id && String(this.school_id) !== tenant.schoolId) {
      return next(new Error('Document belongs to a different school'));
    }
    this.school_id = tenant.schoolId;
    next();
  });

  schema.pre('insertMany', function applyInsertManyTenantScope(next, documents) {
    const tenant = getTenantContext();
    if (tenant?.schoolId) {
      for (const document of documents) {
        if (document.school_id && String(document.school_id) !== tenant.schoolId) {
          return next(new Error('Document belongs to a different school'));
        }
        document.school_id = tenant.schoolId;
      }
    }
    next();
  });
};

module.exports = tenantScopePlugin;