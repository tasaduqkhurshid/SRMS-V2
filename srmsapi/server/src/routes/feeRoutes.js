const router = require('express').Router();
const FeeController = require('../controllers/FeeController');

router.get('/dashboard', FeeController.dashboard);
router.get('/types', FeeController.listTypes);
router.post('/types', FeeController.saveType);
router.patch('/types/:id', FeeController.saveType);
router.get('/structures', FeeController.listStructures);
router.post('/structures', FeeController.saveStructure);
router.patch('/structures/:id', FeeController.saveStructure);
router.post('/assignments', FeeController.assign);
router.post('/parent-access', FeeController.parentAccess);
router.get('/accounts', FeeController.listAccounts);
router.get('/accounts/:id', FeeController.getAccount);
router.post('/accounts/:id/collections', FeeController.collect);
router.post('/accounts/:id/adjustments', FeeController.adjust);
router.get('/payments', FeeController.listPayments);
router.post('/payments/:id/refunds', FeeController.refund);
router.get('/payments/:id/receipt', FeeController.receipt);
router.get('/audit', FeeController.audit);
router.get('/reports', FeeController.report);
router.get('/reports/export.csv', FeeController.reportCsv);
router.get('/online-settings', FeeController.onlineSettings);

module.exports = router;
