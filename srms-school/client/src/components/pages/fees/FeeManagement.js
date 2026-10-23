import template from './FeeManagementTemplate.js';
import { api } from '../../../Services/api.js';

const { ref, computed, onMounted, watch } = Vue;
const { useRoute, useRouter } = VueRouter;
const feeSections = ['overview', 'types', 'structures', 'assign', 'parents', 'accounts', 'payments', 'reports', 'audit'];
const money = (minor) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format((Number(minor) || 0) / 100);
const createIdempotencyKey = () => {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID();
  if (typeof cryptoApi?.getRandomValues === 'function') {
    return Array.from(cryptoApi.getRandomValues(new Uint8Array(16)), (value) => value.toString(16).padStart(2, '0')).join('');
  }
  return `fee-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};
const toastMessage = (type, message) => {
  const notify = window.toast?.[type];
  if (typeof notify === 'function') notify(message);
  else window.alert(message);
};

export default {
  name: 'FeeManagement',
  template,
  setup() {
    const route = useRoute();
    const router = useRouter();
    const activeSection = computed(() => feeSections.includes(route.params.section) ? route.params.section : 'overview');
    const loading = ref(false);
    const saving = ref(false);
    const error = ref('');
    const dashboard = ref({});
    const feeTypes = ref([]);
    const structures = ref([]);
    const accounts = ref([]);
    const accountPagination = ref({ page: 1, limit: 20, total: 0, pages: 1 });
    const payments = ref([]);
    const paymentPagination = ref({ page: 1, limit: 20, total: 0, pages: 1 });
    const feeReport = ref({ summary: {}, by_course: [], payment_methods: [], rows: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } });
    const auditEvents = ref([]);
    const reportYear = ref('');
    const reportCourse = ref('');
    const reportFrom = ref('');
    const reportTo = ref('');
    const editingTypeId = ref('');
    const editingStructureId = ref('');
    const courses = ref([]);
    const academicYears = ref([]);
    const students = ref([]);
    const appliedSearch = ref('');
    const accountSearch = ref('');
    const accountSort = ref('createdAt_desc');
    const paymentSearch = ref('');
    const paymentSort = ref('createdAt_desc');
    const paymentFrom = ref('');
    const paymentTo = ref('');
    const paymentMethod = ref('');
    const typeForm = ref({ name: '', code: '', description: '' });
    const structureForm = ref({ name: '', course_id: '', academic_year_id: '', due_day: 10, lines: [{ fee_type_id: '', amount: '', billing_period: 'MONTHLY', required: true }] });
    const assignment = ref({ fee_structure_id: '', concession: '', optional_fee_type_ids: [], student_ids: [], student_options: {} });
    watch(() => assignment.value.fee_structure_id, () => { assignment.value.optional_fee_type_ids = []; assignment.value.student_options = {}; assignment.value.student_ids = []; assignment.value.concession = ''; });
    const parentForm = ref({ username: '', email: '', password: '', student_ids: [] });
    const dialog = ref({ open: false, kind: '', account: null, payment: null, installment: null });
    const paymentForm = ref({ amount: '', method: 'CASH', reference: '', notes: '', idempotency_key: '' });
    const adjustmentForm = ref({ kind: 'CONCESSION', amount: '', reason: '', idempotency_key: '' });
    const refundForm = ref({ amount: '', reason: '', reference: '', idempotency_key: '' });
    const accountStudents = computed(() => {
      const structure = structures.value.find((row) => row._id === assignment.value.fee_structure_id);
      if (!structure) return [];
      const courseId = String(structure.course_id?._id || structure.course_id || '');
      const course = courses.value.find((row) => String(row._id) === courseId);
      const classValues = new Set([
        courseId, structure.course_id?.course_name, structure.course_id?.course_code,
        course?.course_name, course?.course_code,
      ].filter(Boolean).map((value) => String(value).trim().toLowerCase()));
      return students.value.filter((student) => classValues.has(String(student.class || '').trim().toLowerCase()));
    });
    const selectedAssignmentStudents = computed(() => accountStudents.value.filter((student) => assignment.value.student_ids.includes(student._id)));
    const assignmentStructure = computed(() => structures.value.find((row) => row._id === assignment.value.fee_structure_id) || null);
    const assignmentOptionalLines = computed(() => (assignmentStructure.value?.lines || []).filter((line) => line.required === false));
    const assignmentStudentLines = computed(() => assignmentStructure.value?.lines || []);
    const lineIncluded = (line, choices = assignment.value) => line.required !== false || (choices.optional_fee_type_ids || []).includes(String(line.fee_type_id?._id || line.fee_type_id));
    const assignmentMonthlyTotalMinor = computed(() => (assignmentStructure.value?.lines || []).reduce((sum, line) =>
      sum + (lineIncluded(line) && line.billing_period !== 'ANNUAL' ? Number(line.amount_minor || 0) : 0), 0));
    const assignmentAnnualTotalMinor = computed(() => (assignmentStructure.value?.lines || []).reduce((sum, line) =>
      sum + (lineIncluded(line) && line.billing_period === 'ANNUAL' ? Number(line.amount_minor || 0) : 0), 0));
    const assignmentMonthsRemaining = computed(() => {
      const year = assignmentStructure.value?.academic_year_id;
      if (!year?.start_date || !year?.end_date) return 0;
      const now = new Date();
      const start = new Date(year.start_date);
      const end = new Date(year.end_date);
      const current = new Date(now.getFullYear(), now.getMonth(), 1);
      const first = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 1);
      const month = first < current ? current : first;
      return month > last ? 0 : (last.getFullYear() - month.getFullYear()) * 12 + last.getMonth() - month.getMonth() + 1;
    });
    const assignmentTotalMinor = computed(() => assignmentMonthlyTotalMinor.value * assignmentMonthsRemaining.value + assignmentAnnualTotalMinor.value);
    const assignmentTargets = computed(() => selectedAssignmentStudents.value.length ? selectedAssignmentStudents.value : assignmentStructure.value ? accountStudents.value : []);
    const collectiveMonthlyGross = computed(() => selectedAssignmentStudents.value.length
      ? assignmentTargets.value.reduce((sum, student) => sum + studentMonthlyTotal(student._id), 0)
      : assignmentMonthlyTotalMinor.value * assignmentTargets.value.length);
    const collectiveMonthlyConcession = computed(() => selectedAssignmentStudents.value.length
      ? assignmentTargets.value.reduce((sum, student) => sum + studentMonthlyConcession(student._id), 0)
      : 0);
    const collectiveMonthlyNet = computed(() => Math.max(0, collectiveMonthlyGross.value - collectiveMonthlyConcession.value));
    const collectiveAnnualNet = computed(() => collectiveMonthlyNet.value * 12 + (selectedAssignmentStudents.value.length
      ? assignmentTargets.value.reduce((sum, student) => sum + studentAnnualTotal(student._id) - studentAnnualConcession(student._id), 0)
      : assignmentAnnualTotalMinor.value * assignmentTargets.value.length));
    const collectiveAssignedNet = computed(() => selectedAssignmentStudents.value.length
      ? assignmentTargets.value.reduce((sum, student) => sum + studentPayable(student._id), 0)
      : Math.max(0, (collectiveMonthlyNet.value * assignmentMonthsRemaining.value + assignmentAnnualTotalMinor.value * assignmentTargets.value.length) - Math.round(Number(assignment.value.concession || 0) * 100) * assignmentTargets.value.length));
    const studentMonthlyTotal = (studentId) => {
      const choices = assignment.value.student_options[studentId] || { optional_fee_type_ids: [] };
      return (assignmentStructure.value?.lines || []).reduce((sum, line) => sum + (lineIncluded(line, choices) && line.billing_period !== 'ANNUAL' ? Number(line.amount_minor || 0) : 0), 0);
    };
    const studentAnnualTotal = (studentId) => {
      const choices = assignment.value.student_options[studentId] || { optional_fee_type_ids: [] };
      return (assignmentStructure.value?.lines || []).reduce((sum, line) => sum + (lineIncluded(line, choices) && line.billing_period === 'ANNUAL' ? Number(line.amount_minor || 0) : 0), 0);
    };
    const studentMonthlyConcession = (studentId) => {
      const choices = assignment.value.student_options[studentId] || { optional_fee_type_ids: [], concessions: {} };
      return (assignmentStructure.value?.lines || []).reduce((sum, line) => {
        const id = String(line.fee_type_id?._id || line.fee_type_id);
        const included = line.required !== false || choices.optional_fee_type_ids.includes(id);
        return sum + (included && line.billing_period !== 'ANNUAL' ? Math.round(Number(choices.concessions?.[id] || 0) * 100) : 0);
      }, 0);
    };
    const studentAnnualConcession = (studentId) => {
      const choices = assignment.value.student_options[studentId] || { optional_fee_type_ids: [], concessions: {} };
      return (assignmentStructure.value?.lines || []).reduce((sum, line) => {
        const id = String(line.fee_type_id?._id || line.fee_type_id);
        return sum + (line.billing_period === 'ANNUAL' && lineIncluded(line, choices) ? Math.round(Number(choices.concessions?.[id] || 0) * 100) : 0);
      }, 0);
    };
    const studentLineIncluded = (studentId, line) => line.required !== false || (assignment.value.student_options[studentId]?.optional_fee_type_ids || []).includes(String(line.fee_type_id?._id || line.fee_type_id));
    const studentLineConcession = (studentId, line) => Math.round(Number(assignment.value.student_options[studentId]?.concessions?.[String(line.fee_type_id?._id || line.fee_type_id)] || 0) * 100);
    const studentTotal = (studentId) => studentMonthlyTotal(studentId) * assignmentMonthsRemaining.value + studentAnnualTotal(studentId);
    const studentPayable = (studentId) => Math.max(0, (studentMonthlyTotal(studentId) - studentMonthlyConcession(studentId)) * assignmentMonthsRemaining.value + studentAnnualTotal(studentId) - studentAnnualConcession(studentId));
    const assignmentPayableMinor = computed(() => Math.max(0, assignmentTotalMinor.value - Math.round(Number(assignment.value.concession || 0) * 100)));
    const unwrap = (response) => response?.data?.data ?? response?.data ?? {};
    const fetchOptions = async () => {
      const [coursesResponse, yearsResponse, studentsResponse] = await Promise.all([
        api.get('/options/courses/all'), api.get('/academic-years/all'), api.get('/students', { params: { page: 1, limit: 500 } }),
      ]);
      courses.value = unwrap(coursesResponse).courses || unwrap(coursesResponse) || [];
      academicYears.value = unwrap(yearsResponse).years || unwrap(yearsResponse) || [];
      students.value = unwrap(studentsResponse).students || unwrap(studentsResponse).results || [];
    };
    const loadTypes = async () => { feeTypes.value = unwrap(await api.get('/fees/types')) || []; };
    const loadStructures = async () => { structures.value = unwrap(await api.get('/fees/structures')) || []; };
    const loadDashboard = async () => { dashboard.value = unwrap(await api.get('/fees/dashboard')); };
    const loadAccounts = async (page = accountPagination.value.page) => {
      const [sort_by, sort_direction] = accountSort.value.split('_');
      const response = unwrap(await api.get('/fees/accounts', { params: { page, limit: accountPagination.value.limit, sort_by, sort_direction, ...(appliedSearch.value ? { q: appliedSearch.value } : {}) } }));
      accounts.value = response.accounts || [];
      accountPagination.value = response.pagination || accountPagination.value;
    };
    const loadPayments = async (page = paymentPagination.value.page) => {
      const [sort_by, sort_direction] = paymentSort.value.split('_');
      const params = { page, limit: paymentPagination.value.limit, sort_by, sort_direction };
      if (paymentSearch.value) params.q = paymentSearch.value;
      if (paymentFrom.value) params.from = paymentFrom.value;
      if (paymentTo.value) params.to = paymentTo.value;
      if (paymentMethod.value) params.method = paymentMethod.value;
      const response = unwrap(await api.get('/fees/payments', { params }));
      payments.value = response.payments || [];
      paymentPagination.value = response.pagination || paymentPagination.value;
    };
    const clearPaymentFilters = async () => { paymentSearch.value = ''; paymentFrom.value = ''; paymentTo.value = ''; paymentMethod.value = ''; paymentSort.value = 'createdAt_desc'; await loadPayments(1); };
    const reportParams = (page = feeReport.value.pagination.page) => ({
      page, limit: feeReport.value.pagination.limit || 20,
      ...(reportYear.value ? { academic_year_id: reportYear.value } : {}),
      ...(reportCourse.value ? { course_id: reportCourse.value } : {}),
      ...(reportFrom.value ? { from: reportFrom.value } : {}),
      ...(reportTo.value ? { to: reportTo.value } : {}),
    });
    const loadReport = async (page = 1) => { feeReport.value = unwrap(await api.get('/fees/reports', { params: reportParams(page) })); };
    const loadAudit = async () => { auditEvents.value = unwrap(await api.get('/fees/audit', { params: { limit: 50 } })) || []; };
    const loadSectionData = (section) => {
      const request = section === 'reports' ? loadReport(1) : section === 'audit' ? loadAudit() : null;
      if (request) { error.value = ''; request.catch((cause) => { error.value = cause.response?.data?.message || cause.message; }); }
    };
    const selectSection = (section) => {
      if (!feeSections.includes(section)) return;
      if (activeSection.value === section) {
        loadSectionData(section);
        return;
      }
      router.push(`/fees/${section}`);
    };
    const clearReportFilters = async () => { reportYear.value = ''; reportCourse.value = ''; reportFrom.value = ''; reportTo.value = ''; await loadReport(1); };
    const refresh = async () => {
      loading.value = true; error.value = '';
      try {
        await Promise.all([fetchOptions(), loadTypes(), loadStructures(), loadDashboard(), loadAccounts(1), loadPayments(1), ...(activeSection.value === 'reports' ? [loadReport(1)] : []), ...(activeSection.value === 'audit' ? [loadAudit()] : [])]);
      } catch (cause) { error.value = cause.response?.data?.message || cause.message || 'Fee information could not be loaded.'; }
      finally { loading.value = false; }
    };
    const resetTypeForm = () => { typeForm.value = { name: '', code: '', description: '' }; editingTypeId.value = ''; };
    const editType = (type) => { typeForm.value = { name: type.name, code: type.code, description: type.description || '' }; editingTypeId.value = type._id; };
    const saveType = async () => {
      saving.value = true;
      const wasEditing = Boolean(editingTypeId.value);
      try {
        if (editingTypeId.value) await api.patch(`/fees/types/${editingTypeId.value}`, { ...typeForm.value, active: feeTypes.value.find((type) => type._id === editingTypeId.value)?.active !== false });
        else await api.post('/fees/types', typeForm.value);
        resetTypeForm(); await loadTypes(); toastMessage('success', wasEditing ? 'Fee type updated.' : 'Fee type created.');
      }
      catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
      finally { saving.value = false; }
    };
    const toggleType = async (type) => {
      saving.value = true;
      try { await api.patch(`/fees/types/${type._id}`, { name: type.name, code: type.code, description: type.description || '', active: !type.active }); await loadTypes(); toastMessage('success', `Fee type ${type.active ? 'deactivated' : 'activated'}.`); }
      catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
      finally { saving.value = false; }
    };
    const addLine = () => structureForm.value.lines.push({ fee_type_id: '', amount: '', billing_period: 'MONTHLY', required: false });
    const removeLine = (index) => { if (structureForm.value.lines.length > 1) structureForm.value.lines.splice(index, 1); };
    const saveStructure = async () => {
      saving.value = true;
      const payload = {
        name: structureForm.value.name, course_id: structureForm.value.course_id, academic_year_id: structureForm.value.academic_year_id, due_day: Number(structureForm.value.due_day),
        lines: structureForm.value.lines.map((line) => ({ fee_type_id: line.fee_type_id, amount_minor: Math.round(Number(line.amount) * 100), billing_period: line.billing_period === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY', required: line.required !== false })),
      };
      try {
        const wasEditing = Boolean(editingStructureId.value);
        const response = wasEditing
          ? await api.patch(`/fees/structures/${editingStructureId.value}`, { ...payload, active: structures.value.find((item) => item._id === editingStructureId.value)?.active !== false })
          : await api.post('/fees/structures', payload);
        const result = unwrap(response);
        resetStructureForm(); await Promise.all([loadStructures(), loadDashboard(), ...(wasEditing ? [loadAccounts(1)] : [])]);
        toastMessage('success', wasEditing ? `Fee structure updated. ${result.updated_accounts || 0} assigned account(s) recalculated; installments with payments were preserved.` : 'Fee structure saved.');
      }
      catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
      finally { saving.value = false; }
    };
    const resetStructureForm = () => { structureForm.value = { name: '', course_id: '', academic_year_id: '', due_day: 10, lines: [{ fee_type_id: '', amount: '', billing_period: 'MONTHLY', required: true }] }; editingStructureId.value = ''; };
    const editStructure = (structure) => {
      structureForm.value = {
        name: structure.name, course_id: structure.course_id?._id || structure.course_id, due_day: structure.due_day || 10,
        academic_year_id: structure.academic_year_id?._id || structure.academic_year_id,
        lines: (structure.lines || []).map((line, index) => ({ fee_type_id: line.fee_type_id?._id || line.fee_type_id, amount: (Number(line.amount_minor) / 100).toFixed(2), billing_period: line.billing_period === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY', required: line.required !== false || index === 0 })),
      };
      editingStructureId.value = structure._id;
    };
    const toggleStructure = async (structure) => {
      saving.value = true;
      try {
        await api.patch(`/fees/structures/${structure._id}`, {
          name: structure.name, course_id: structure.course_id?._id || structure.course_id,
          academic_year_id: structure.academic_year_id?._id || structure.academic_year_id,
          due_day: structure.due_day || 10,
          lines: (structure.lines || []).map((line) => ({ fee_type_id: line.fee_type_id?._id || line.fee_type_id, amount_minor: line.amount_minor, billing_period: line.billing_period === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY', required: line.required !== false })),
          active: !structure.active,
        });
        await loadStructures(); toastMessage('success', `Fee structure ${structure.active ? 'deactivated' : 'activated'}.`);
      } catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
      finally { saving.value = false; }
    };
    const exportReport = async () => {
      try {
        const response = await api.get('/fees/reports/export.csv', { params: reportParams(feeReport.value.pagination.page), responseType: 'blob' });
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a'); link.href = url; link.download = `fee-report-page-${feeReport.value.pagination.page}.csv`; link.click(); URL.revokeObjectURL(url);
      } catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
    };
    const assignFees = async () => {
      if (!assignment.value.fee_structure_id) return toastMessage('error', 'Select a fee structure first.');
      saving.value = true;
      try {
        const studentOptions = assignment.value.student_ids.map((student_id) => {
          const choices = assignment.value.student_options[student_id] || {};
          const includedIds = new Set((assignmentStructure.value?.lines || []).filter((line) => line.required !== false || (choices.optional_fee_type_ids || []).includes(String(line.fee_type_id?._id || line.fee_type_id))).map((line) => String(line.fee_type_id?._id || line.fee_type_id)));
          const concession_by_fee_type_minor = Object.fromEntries(Object.entries(choices.concessions || {}).filter(([fee_type_id]) => includedIds.has(fee_type_id)).map(([fee_type_id, amount]) => [fee_type_id, Math.round(Number(amount || 0) * 100)]));
          return { student_id, optional_fee_type_ids: choices.optional_fee_type_ids || [], concession_by_fee_type_minor };
        });
        const data = unwrap(await api.post('/fees/assignments', { fee_structure_id: assignment.value.fee_structure_id, student_ids: assignment.value.student_ids, student_options: studentOptions, optional_fee_type_ids: assignment.value.optional_fee_type_ids, concession_minor: assignment.value.student_ids.length ? 0 : Math.round(Number(assignment.value.concession || 0) * 100) }));
        toastMessage('success', `${data.assigned} account(s) assigned; ${data.skipped} existing account(s) skipped.`);
        assignment.value = { ...assignment.value, optional_fee_type_ids: [], student_ids: [], student_options: {} };
        await Promise.all([loadAccounts(1), loadDashboard()]);
      } catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
      finally { saving.value = false; }
    };
    const createParentAccess = async () => {
      saving.value = true;
      try {
        const result = unwrap(await api.post('/fees/parent-access', { ...parentForm.value }));
        toastMessage('success', `Parent access created for ${result.linked_student_count} student(s).`);
        parentForm.value = { username: '', email: '', password: '', student_ids: [] };
      } catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
      finally { saving.value = false; }
    };
    const searchAccounts = async () => { appliedSearch.value = accountSearch.value.trim(); await loadAccounts(1); };
    const openDialog = (kind, account = null, payment = null, installment = null) => {
      dialog.value = { open: true, kind, account, payment, installment };
      const idempotencyKey = createIdempotencyKey();
      paymentForm.value = { amount: installment ? (Number(installment.balance_minor || 0) / 100).toFixed(2) : '', method: 'CASH', reference: '', notes: installment ? `Collection for ${installment.name}` : '', installment_id: installment?._id || '', idempotency_key: idempotencyKey };
      adjustmentForm.value = { kind: 'CONCESSION', amount: '', reason: '', idempotency_key: idempotencyKey };
      refundForm.value = { amount: '', reason: '', reference: '', idempotency_key: idempotencyKey };
    };
    const closeDialog = () => { dialog.value = { open: false, kind: '', account: null, payment: null, installment: null }; };
    const viewStatement = async (account) => {
      try {
        const detail = unwrap(await api.get(`/fees/accounts/${account._id}`));
        dialog.value = { open: true, kind: 'statement', account: detail, payment: null, installment: null };
      } catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
    };
    const submitCollection = async () => {
      saving.value = true;
      try {
        const idempotencyKey = paymentForm.value.idempotency_key || createIdempotencyKey();
        paymentForm.value.idempotency_key = idempotencyKey;
        const payload = { ...paymentForm.value, idempotency_key: idempotencyKey, amount_minor: Math.round(Number(paymentForm.value.amount) * 100) };
        await api.post(`/fees/accounts/${dialog.value.account._id}/collections`, payload);
        toastMessage('success', 'Collection recorded and receipt issued.'); closeDialog(); await Promise.all([loadAccounts(), loadPayments(1), loadDashboard()]);
      } catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
      finally { saving.value = false; }
    };
    const submitAdjustment = async () => {
      saving.value = true;
      try {
        const idempotencyKey = adjustmentForm.value.idempotency_key || createIdempotencyKey();
        adjustmentForm.value.idempotency_key = idempotencyKey;
        const amount = Math.round(Number(adjustmentForm.value.amount) * 100);
        const kind = adjustmentForm.value.kind === 'CONCESSION' ? 'CONCESSION' : 'ADJUSTMENT';
        const delta = adjustmentForm.value.kind === 'REDUCTION' ? -amount : amount;
        await api.post(`/fees/accounts/${dialog.value.account._id}/adjustments`, { kind, amount_minor: amount, delta_minor: kind === 'ADJUSTMENT' ? delta : undefined, reason: adjustmentForm.value.reason, idempotency_key: idempotencyKey });
        toastMessage('success', kind === 'CONCESSION' ? 'Concession approved and recorded.' : 'Fee adjustment recorded.'); closeDialog(); await Promise.all([loadAccounts(), loadDashboard()]);
      } catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
      finally { saving.value = false; }
    };
    const submitRefund = async () => {
      saving.value = true;
      try {
        const idempotencyKey = refundForm.value.idempotency_key || createIdempotencyKey();
        refundForm.value.idempotency_key = idempotencyKey;
        const refund = unwrap(await api.post(`/fees/payments/${dialog.value.payment._id}/refunds`, { amount_minor: Math.round(Number(refundForm.value.amount) * 100), reason: refundForm.value.reason, reference: refundForm.value.reference, idempotency_key: idempotencyKey }));
        toastMessage('success', refund.status === 'PENDING' && refund.method === 'ONLINE' ? 'Online refund requested. The fee balance updates after provider confirmation.' : 'Refund recorded.'); closeDialog(); await Promise.all([loadAccounts(), loadPayments(), loadDashboard()]);
      } catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
      finally { saving.value = false; }
    };
    const printReceipt = async (payment) => {
      try {
        const receipt = unwrap(await api.get(`/fees/payments/${payment._id}/receipt`));
        const student = receipt.student_id || {};
        const popup = window.open('', '_blank', 'width=720,height=760');
        if (!popup) return toastMessage('error', 'Allow pop-ups to print the receipt.');
        const escape = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
        popup.document.write(`<title>Fee receipt ${escape(receipt.receipt_number)}</title><style>body{font:15px Arial;color:#132344;padding:40px}.receipt{max-width:620px;margin:auto;border:1px solid #dbe3ee;border-radius:14px;padding:28px}h1{margin:0 0 6px}p{display:flex;justify-content:space-between;border-bottom:1px solid #eef1f6;padding:12px 0}.amount{font-size:24px;font-weight:bold;color:#4338ca}</style><article class="receipt"><h1>Fee payment receipt</h1><p><span>Receipt number</span><b>${escape(receipt.receipt_number)}</b></p><p><span>Student</span><b>${escape(student.name)}</b></p><p><span>Admission / roll</span><b>${escape(student.admission_number || student.roll_number)}</b></p><p><span>Fee account</span><b>${escape(receipt.account_id?.structure_name)}</b></p><p><span>Payment method</span><b>${escape(receipt.method)}</b></p><p><span>Date</span><b>${escape(new Date(receipt.confirmed_at || receipt.createdAt).toLocaleString())}</b></p><p class="amount"><span>Collected</span><b>${money(receipt.amount_minor)}</b></p><button onclick="window.print()">Print / Save PDF</button></article>`);
        popup.document.close();
      } catch (cause) { toastMessage('error', cause.response?.data?.message || cause.message); }
    };
    const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '—';
    const toggleStudent = (studentId, checked) => {
      const ids = new Set(assignment.value.student_ids);
      if (checked) { ids.add(studentId); assignment.value.student_options[studentId] ||= { optional_fee_type_ids: [], concessions: {} }; }
      else { ids.delete(studentId); delete assignment.value.student_options[studentId]; }
      assignment.value.student_ids = [...ids];
    };
    const selectAllStudents = () => {
      assignment.value.student_ids = accountStudents.value.map((student) => student._id);
      for (const student of accountStudents.value) assignment.value.student_options[student._id] ||= { optional_fee_type_ids: [], concessions: {} };
    };
    const clearStudentSelection = () => { assignment.value.student_ids = []; assignment.value.student_options = {}; };
    const installmentLine = (installment, line) => (installment?.lines || []).find((item) => String(item.fee_type_id?._id || item.fee_type_id) === String(line.fee_type_id?._id || line.fee_type_id));
    onMounted(refresh);
    return { activeSection, loading, saving, error, dashboard, feeTypes, structures, students, accounts, accountPagination, payments, paymentPagination, feeReport, auditEvents, reportYear, reportCourse, reportFrom, reportTo, editingTypeId, editingStructureId, courses, academicYears, accountSearch, accountSort, paymentSearch, paymentSort, paymentFrom, paymentTo, paymentMethod, typeForm, structureForm, assignment, parentForm, accountStudents, selectedAssignmentStudents, assignmentStructure, assignmentOptionalLines, assignmentStudentLines, assignmentMonthsRemaining, assignmentTargets, collectiveMonthlyGross, collectiveMonthlyConcession, collectiveMonthlyNet, collectiveAnnualNet, collectiveAssignedNet, assignmentMonthlyTotalMinor, assignmentAnnualTotalMinor, assignmentTotalMinor, assignmentPayableMinor, studentMonthlyTotal, studentMonthlyConcession, studentAnnualTotal, studentAnnualConcession, studentLineIncluded, studentLineConcession, studentTotal, studentPayable, dialog, paymentForm, adjustmentForm, refundForm, money, formatDate, installmentLine, refresh, selectSection, saveType, resetTypeForm, editType, toggleType, addLine, removeLine, saveStructure, resetStructureForm, editStructure, toggleStructure, assignFees, createParentAccess, searchAccounts, loadAccounts, loadPayments, clearPaymentFilters, loadReport, clearReportFilters, exportReport, openDialog, closeDialog, viewStatement, submitCollection, submitAdjustment, submitRefund, printReceipt, selectAllStudents, clearStudentSelection, toggleStudent };
  },
};
