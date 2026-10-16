<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { portalApi } from '../services/api.js';

const props = defineProps({ section: { type: String, required: true } });
const router = useRouter();
const data = ref(null);
const loading = ref(true);
const error = ref('');
const actionMessage = ref('');
const actionBusy = ref(false);
const session = portalApi.getSession() || {};
const school = computed(() => session?.school || {});
const children = computed(() => session?.children?.length ? session.children : session?.student ? [session.student] : []);
const parentMode = computed(() => String(session?.user?.role || '').toLowerCase() === 'parent');
const selectedStudentId = ref(children.value[0]?.id || children.value[0]?._id || '');
const student = computed(() => children.value.find((item) => String(item.id || item._id) === String(selectedStudentId.value)) || children.value[0] || session?.student || {});
const allNavigation = [
  ['dashboard', 'Overview'], ['profile', 'Profile'], ['results', 'Results'], ['performance', 'Performance'],
  ['attendance', 'Attendance'], ['fees', 'Fees'], ['lectures', 'Lectures'], ['notes', 'Notes'], ['notifications', 'Notifications'],
];
const navigation = computed(() => parentMode.value ? [['fees', 'Fees']] : allNavigation);
const title = computed(() => props.section[0].toUpperCase() + props.section.slice(1));
const displayValue = (value) => value === null || value === undefined || value === '' ? '—' : value;
const money = (minor) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format((Number(minor) || 0) / 100);
const shortDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

async function loadSection(preserveActionMessage = false) {
  loading.value = true;
  error.value = '';
  if (preserveActionMessage !== true) actionMessage.value = '';
  const endpoint = props.section === 'dashboard' ? '/api/student/dashboard' : `/api/student/${props.section}`;
  const query = props.section === 'fees' && parentMode.value && selectedStudentId.value
    ? `?student_id=${encodeURIComponent(selectedStudentId.value)}` : '';
  try {
    data.value = await portalApi.request(`${endpoint}${query}`);
  } catch (cause) {
    error.value = cause.message;
    if (cause.message.toLowerCase().includes('authentication')) { portalApi.logout(); router.replace('/login'); }
  } finally { loading.value = false; }
}

function logout() { portalApi.logout(); router.replace('/login'); }

async function printReceipt(payment, childId = selectedStudentId.value) {
  try {
    const query = parentMode.value ? `?student_id=${encodeURIComponent(childId)}` : '';
    const receipt = await portalApi.request(`/api/student/fees/receipts/${encodeURIComponent(payment._id)}${query}`);
    const popup = window.open('', '_blank', 'width=720,height=760');
    if (!popup) { actionMessage.value = 'Allow pop-ups to print the receipt.'; return; }
    const escape = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const child = receipt.student_id || student.value;
    popup.document.write(`<title>Fee receipt ${escape(receipt.receipt_number)}</title><style>body{font:15px Arial;color:#132344;padding:40px}.receipt{max-width:620px;margin:auto;border:1px solid #dbe3ee;border-radius:14px;padding:28px}h1{margin:0 0 6px}p{display:flex;justify-content:space-between;border-bottom:1px solid #eef1f6;padding:12px 0}.amount{font-size:24px;font-weight:bold;color:#2058dc}</style><article class="receipt"><h1>${escape(school.value.name || 'School')} · Fee receipt</h1><p><span>Receipt number</span><b>${escape(receipt.receipt_number)}</b></p><p><span>Student</span><b>${escape(child.name)}</b></p><p><span>Admission / roll</span><b>${escape(child.admission_number || child.roll_number)}</b></p><p><span>Payment method</span><b>${escape(receipt.method)}</b></p><p><span>Date</span><b>${escape(new Date(receipt.confirmed_at || receipt.createdAt).toLocaleString())}</b></p><p class="amount"><span>Collected</span><b>${money(receipt.amount_minor)}</b></p><button onclick="window.print()">Print / Save PDF</button></article>`);
    popup.document.close();
  } catch (cause) { actionMessage.value = cause.message; }
}

async function checkOnlinePayment(paymentId) {
  try {
    const result = await portalApi.request(`/api/student/fees/payments/${encodeURIComponent(paymentId)}/cancel`, { method: 'POST' });
    const message = result.status === 'CANCELLED'
      ? 'The payment order expired without a confirmed payment. You can start a new payment.'
      : (result.message || 'Payment is still being checked by the provider. The balance changes only after server confirmation.');
    await loadSection(true);
    actionMessage.value = message;
  } catch (cause) { actionMessage.value = cause.message; }
}

async function payNow(account) {
  if (!data.value?.online_payments?.eligible || actionBusy.value) return;
  actionBusy.value = true;
  actionMessage.value = '';
  try {
    const order = await portalApi.request(`/api/student/fees/accounts/${encodeURIComponent(account._id)}/payments`, {
      method: 'POST',
      body: JSON.stringify({ amount_minor: account.balance_minor, idempotency_key: crypto.randomUUID() }),
    });
    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Secure checkout could not be loaded.'));
        document.head.appendChild(script);
      });
    }
    const checkout = new window.Razorpay({
      key: order.key_id,
      amount: order.amount_minor,
      currency: order.currency || 'INR',
      order_id: order.order_id,
      name: school.value.name || 'School',
      description: account.structure_name || 'Student fee payment',
      prefill: { name: student.value.name },
      handler: () => {
        actionMessage.value = 'Payment submitted. The fee balance will update after server confirmation.';
        window.setTimeout(() => loadSection(true), 2500);
      },
      modal: { ondismiss: () => { checkOnlinePayment(order.payment_id); } },
      theme: { color: '#493cf1' },
    });
    checkout.open();
  } catch (cause) { actionMessage.value = cause.message; }
  finally { actionBusy.value = false; }
}

onMounted(loadSection);
watch(() => props.section, loadSection);
watch(selectedStudentId, () => { if (props.section === 'fees' && parentMode.value) loadSection(); });
</script>

<template>
  <div class="portal-layout">
    <aside class="portal-sidebar"><a class="portal-brand" href="/dashboard"><span>{{ school.abbreviation || 'SR' }}</span><b>{{ school.name || 'Student Portal' }}<small>{{ parentMode ? 'Parent access' : 'Student Portal' }}</small></b></a><nav><RouterLink v-for="item in navigation" :key="item[0]" :to="`/${item[0]}`" :class="{ active: item[0] === section }">{{ item[1] }}</RouterLink></nav><button class="logout-button" @click="logout">Sign out</button></aside>
    <main class="portal-main"><header class="portal-topbar"><div><small>{{ parentMode ? 'FAMILY FEE PORTAL' : 'STUDENT PORTAL' }}</small><h1>{{ title }}</h1></div><label v-if="section === 'fees' && parentMode && children.length > 1" class="child-selector">Student<select v-model="selectedStudentId"><option v-for="child in children" :key="child.id || child._id" :value="child.id || child._id">{{ child.name }} · {{ child.className || child.class }}</option></select></label><div class="student-chip"><span>{{ (student.name || 'Student').slice(0,1) }}</span>{{ student.name || 'Student' }}</div></header>
      <div v-if="error" class="portal-error" role="alert"><span>{{ error }}</span><button class="portal-retry" @click="loadSection">Retry</button></div>
      <p v-if="actionMessage" class="portal-message" role="status">{{ actionMessage }}</p>
      <div v-if="loading" class="portal-card portal-loading">Loading {{ title.toLowerCase() }}…</div>
      <template v-else-if="!error">
        <section v-if="section === 'dashboard'" class="portal-stats"><article><small>Attendance</small><strong>{{ displayValue(data?.dashboard?.attendance) }}%</strong></article><article><small>Performance</small><strong>{{ displayValue(data?.dashboard?.performance) }}%</strong></article><article><small>Next examination</small><strong>{{ displayValue(data?.dashboard?.nextExam) }}</strong></article><article><small>School</small><strong>{{ school.name || '—' }}</strong></article></section>
        <section v-if="section === 'fees'" class="fee-portal-view">
          <div v-if="data?.summary" class="fee-portal-summary"><article><small>Assigned</small><strong>{{ money(data.summary.gross_minor) }}</strong></article><article><small>Concessions</small><strong>{{ money(data.summary.concessions_minor) }}</strong></article><article><small>Paid</small><strong>{{ money(data.summary.paid_minor) }}</strong></article><article><small>Outstanding</small><strong>{{ money(data.summary.outstanding_minor) }}</strong></article></div>
          <template v-if="data?.accounts?.length">
            <section v-for="account in data.accounts" :key="account._id" class="portal-card fee-account-card"><header><div><h2>{{ account.structure_name }}</h2><p>{{ account.academic_year_id?.name || 'Academic year' }} · {{ student.className || student.class || 'Class' }} {{ student.section || '' }}</p></div><div class="fee-balance"><small>Outstanding</small><strong>{{ money(account.balance_minor) }}</strong></div></header><div class="fee-account-progress"><span :style="{ width: `${account.gross_minor ? Math.min(100, (account.paid_minor / Math.max(1, account.gross_minor - account.concession_minor)) * 100) : 0}%` }"></span></div><div class="fee-account-subtotals"><span>Assigned {{ money(account.gross_minor) }}</span><span>Concession {{ money(account.concession_minor) }}</span><span>Paid {{ money(account.paid_minor) }}</span></div>
              <h3>Installments</h3><div class="fee-installments"><article v-for="installment in account.installments" :key="installment._id"><div><b>{{ installment.name }}</b><small>Due {{ shortDate(installment.due_date) }}</small></div><div class="fee-installment-amount"><b>{{ money(installment.balance_minor) }}</b><span :class="['portal-status', installment.overdue ? 'overdue' : installment.balance_minor ? 'pending' : 'paid']">{{ installment.overdue ? 'Overdue' : installment.balance_minor ? 'Due' : 'Paid' }}</span></div></article></div>
              <div class="fee-account-actions"><button v-if="data.online_payments?.eligible && account.balance_minor > 0" class="portal-pay-button" :disabled="actionBusy" @click="payNow(account)">{{ actionBusy ? 'Opening secure checkout…' : 'Pay now' }}</button><span v-else-if="account.balance_minor > 0" class="fee-pay-unavailable">Online payments are unavailable for this school.</span></div>
            </section>
          </template>
          <section class="portal-card"><h2>Payment history</h2><div v-if="!data?.transactions?.length" class="portal-empty">No payments have been recorded yet.</div><div v-else class="fee-transaction-list"><article v-for="payment in data.transactions" :key="payment._id"><div><b>{{ payment.receipt_number || payment.reference || 'Payment' }}</b><small>{{ shortDate(payment.createdAt) }} · {{ payment.method.replace('_', ' ') }}</small><small v-if="payment.status_message">{{ payment.status_message }}</small></div><div class="fee-transaction-end"><span :class="['portal-status', payment.status.toLowerCase()]">{{ payment.status }}</span><b>{{ payment.kind === 'REFUND' && payment.status === 'CONFIRMED' ? '−' : '' }}{{ money(payment.amount_minor) }}</b><button v-if="payment.kind === 'COLLECTION' && payment.status === 'CONFIRMED'" class="fee-receipt-button" @click="printReceipt(payment)">Receipt</button><button v-else-if="payment.method === 'ONLINE' && payment.status === 'PENDING'" class="fee-receipt-button" @click="checkOnlinePayment(payment._id)">Check status</button></div></article></div></section>
          <div v-if="!data?.accounts?.length" class="portal-card portal-empty">Your school has not assigned any fee accounts yet.</div>
        </section>
        <section v-else-if="section === 'profile'" class="portal-card"><h2>Profile details</h2><p><b>Name</b>{{ displayValue(data?.student?.name || student.name) }}</p><p><b>Student ID</b>{{ displayValue(data?.student?.admissionNumber || student.admissionNumber) }}</p><p><b>Class / section</b>{{ displayValue(data?.student?.className || student.className) }} / {{ displayValue(data?.student?.section || student.section) }}</p><p><b>Academic year</b>{{ displayValue(data?.academicYear?.name || student.academicYear) }}</p></section>
        <section v-else-if="section !== 'dashboard'" class="portal-card"><h2>{{ title }} details</h2><div v-if="Array.isArray(data) && data.length" class="data-list"><pre v-for="(item,index) in data" :key="item.id || item._id || index">{{ JSON.stringify(item, null, 2) }}</pre></div><div v-else-if="Array.isArray(data?.results) && data.results.length" class="data-list"><pre v-for="(item,index) in data.results" :key="item.id || item._id || index">{{ JSON.stringify(item, null, 2) }}</pre></div><div v-else class="empty-state">No {{ title.toLowerCase() }} information is available yet.</div></section>
      </template>
    </main>
  </div>
</template>
