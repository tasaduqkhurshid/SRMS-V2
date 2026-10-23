import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { palette } from '../../src/theme/theme';
import { formatCurrency, formatShortDate } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/app-store';
import { ApiClient } from '../../src/api/ApiClient';

type FeeLine = { fee_type_id: string; name: string; amount_minor: number; billing_period?: 'MONTHLY' | 'ANNUAL'; concession_minor?: number };
type FeeInstallment = { _id: string; name: string; due_date: string; amount_minor: number; effective_amount_minor?: number; paid_minor: number; balance_minor: number; overdue: boolean };
type FeePayment = { _id: string; receipt_number?: string; reference?: string; method: string; status: string; status_message?: string; kind: string; amount_minor: number; createdAt: string };
type FeeAccount = { _id: string; structure_name: string; gross_minor: number; concession_minor: number; paid_minor: number; balance_minor: number; monthly_total_minor?: number; monthly_concession_minor?: number; lines: FeeLine[]; installments: FeeInstallment[] };
type FeeData = { summary: { gross_minor: number; concessions_minor: number; paid_minor: number; outstanding_minor: number }; accounts: FeeAccount[]; transactions: FeePayment[]; online_payments?: { eligible: boolean; status: string } };

const asRupees = (minor: number) => (Number(minor) || 0) / 100;
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] as string));
const showReceipt = (payment: FeePayment, childName: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const popup = window.open('', '_blank', 'width=720,height=760');
    if (!popup) return Alert.alert('Receipt', 'Allow pop-ups to print the receipt.');
    popup.document.write(`<title>Fee receipt</title><main style="font:16px Arial;max-width:600px;margin:50px auto;padding:24px;border:1px solid #ddd;border-radius:12px"><h1>Fee receipt</h1><p>Receipt: ${escapeHtml(payment.receipt_number || payment.reference || payment._id)}</p><p>Student: ${escapeHtml(childName)}</p><p>Date: ${escapeHtml(new Date(payment.createdAt).toLocaleString())}</p><p>Method: ${escapeHtml(payment.method.replace('_', ' '))}</p><h2>Amount: ${escapeHtml(formatCurrency(asRupees(payment.amount_minor)))}</h2><button onclick="window.print()">Print / Save PDF</button></main>`);
    popup.document.close();
    return;
  }
  Alert.alert('Fee receipt', `${payment.receipt_number || payment.reference || payment._id}\n${childName}\n${formatCurrency(asRupees(payment.amount_minor))}`);
};

export default function FeesScreen() {
  const selectedChild = useAppStore((state) => state.selectedChild());
  const authMode = useAppStore((state) => state.authMode);
  const [fees, setFees] = useState<FeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadFees = async () => {
    if (!selectedChild?.id) { setFees(null); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const query = authMode === 'parent' ? `?student_id=${encodeURIComponent(selectedChild.id)}` : '';
      const result = await ApiClient.request<FeeData>(`/api/student/fees${query}`);
      setFees(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Fee details could not be loaded.');
      setFees(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadFees(); }, [selectedChild?.id, authMode]);

  const startPayment = async (account: FeeAccount) => {
    if (!fees?.online_payments?.eligible || busy || Platform.OS !== 'web') return;
    setBusy(true); setError('');
    try {
      const order = await ApiClient.request<{ key_id: string; order_id: string; amount_minor: number; currency: string; payment_methods?: string[] }>(`/api/student/fees/accounts/${account._id}/payments`, {
        method: 'POST',
        body: JSON.stringify({ amount_minor: account.balance_minor, idempotency_key: crypto.randomUUID() }),
      });
      const win = window as typeof window & { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } };
      if (!win.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(); script.onerror = () => reject(new Error('Secure checkout could not be loaded.'));
          document.head.appendChild(script);
        });
      }
      const Checkout = win.Razorpay;
      if (!Checkout) throw new Error('Secure checkout is unavailable.');
      const allowed = new Set(order.payment_methods || ['upi', 'card', 'netbanking', 'wallet']);
      const methods = ['upi', 'card', 'netbanking', 'wallet'].filter((method) => allowed.has(method)).map((method) => ({ method }));
      new Checkout({ key: order.key_id, order_id: order.order_id, amount: order.amount_minor, currency: order.currency || 'INR', name: 'School', description: account.structure_name, config: { display: { blocks: { schoolMethods: { name: 'Payment methods', instruments: methods } }, sequence: ['block.schoolMethods'], preferences: { show_default_blocks: false } } }, handler: () => { Alert.alert('Payment pending', 'The school will update your fee balance after server verification.'); setTimeout(() => void loadFees(), 2500); }, modal: { ondismiss: () => void loadFees() }, theme: { color: '#4f46e5' } }).open();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Payment could not be started.'); }
    finally { setBusy(false); }
  };

  return (
    <ScreenShell title="Fees" subtitle="Fee summary, installments, and payment history">
      {loading ? <View style={styles.center}><ActivityIndicator color={palette.primary} /><Text style={styles.muted}>Loading fee information…</Text></View> : null}
      {!loading && error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text><Pressable onPress={loadFees} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable></View> : null}
      {!loading && !error && fees ? <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryGrid}>
          <Summary label="Assigned" minor={fees.summary.gross_minor} />
          <Summary label="Concessions" minor={fees.summary.concessions_minor} />
          <Summary label="Paid" minor={fees.summary.paid_minor} />
          <Summary label="Outstanding" minor={fees.summary.outstanding_minor} accent />
        </View>
        {fees.accounts.map((account) => <View key={account._id} style={styles.card}>
          <View style={styles.accountHeader}><View style={styles.flex}><Text style={styles.cardTitle}>{account.structure_name}</Text><Text style={styles.subtle}>{selectedChild?.academicYear || 'Academic year'} · {selectedChild?.className || 'Class'} {selectedChild?.section || ''}</Text></View><View><Text style={styles.caption}>Total payable</Text><Text style={styles.balance}>{formatCurrency(asRupees(account.balance_minor))}</Text></View></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, (account.paid_minor / Math.max(1, account.gross_minor - account.concession_minor)) * 100)}%` }]} /></View>
          <View style={styles.accountTotals}><Text>Assigned {formatCurrency(asRupees(account.gross_minor))}</Text><Text>Concession {formatCurrency(asRupees(account.concession_minor))}</Text><Text>Paid {formatCurrency(asRupees(account.paid_minor))}</Text></View>
          <Text style={styles.sectionTitle}>Fee types · monthly and yearly amounts</Text>
          {account.lines.map((line) => {
            const netAmount = Math.max(0, line.amount_minor - Number(line.concession_minor || 0));
            const isAnnual = line.billing_period === 'ANNUAL';
            return <View key={line.fee_type_id} style={styles.row}><View style={styles.flex}><Text style={styles.rowTitle}>{line.name}</Text><Text style={styles.subtle}>{isAnnual ? 'Yearly fee' : 'Monthly fee'} {formatCurrency(asRupees(line.amount_minor))} · concession {formatCurrency(asRupees(line.concession_minor || 0))}</Text></View><View style={styles.amountWrap}><Text style={styles.rowValue}>{formatCurrency(asRupees(netAmount))}</Text><Text style={styles.caption}>{isAnnual ? 'one-time fee' : 'per month'}</Text></View></View>;
          })}
          <Text style={styles.sectionTitle}>Installments</Text>
          {account.installments.map((installment) => {
            const paid = installment.balance_minor <= 0;
            return <View key={installment._id} style={styles.row}><View style={styles.flex}><Text style={styles.rowTitle}>{installment.name}</Text><Text style={styles.subtle}>Due {formatShortDate(installment.due_date)}{!paid && installment.paid_minor > 0 ? ` · Paid ${formatCurrency(asRupees(installment.paid_minor))}` : ''}</Text></View><View style={styles.amountWrap}><Text style={styles.rowValue}>{formatCurrency(asRupees(paid ? installment.effective_amount_minor ?? installment.amount_minor : installment.balance_minor))}</Text><Text style={[styles.badge, paid ? styles.badgePaid : installment.overdue ? styles.badgeOverdue : styles.badgePending]}>{paid ? 'Paid' : installment.overdue ? 'Overdue' : 'Due'}</Text></View></View>;
          })}
          {fees.online_payments?.eligible && account.balance_minor > 0 && Platform.OS === 'web' ? <Pressable disabled={busy} onPress={() => startPayment(account)} style={[styles.payButton, busy && styles.disabled]}><Text style={styles.payText}>{busy ? 'Opening secure checkout…' : 'Pay now'}</Text></Pressable> : fees.online_payments?.eligible && account.balance_minor > 0 ? <Text style={styles.onlineStatus}>Online payments are available from the school web portal.</Text> : account.balance_minor > 0 ? <Text style={styles.onlineStatus}>Online payments are unavailable for this school.</Text> : null}
        </View>)}
        <View style={styles.card}><Text style={styles.sectionTitle}>Payment history</Text>{fees.transactions.length ? fees.transactions.map((payment) => <View key={payment._id} style={styles.row}><View style={styles.flex}><Text style={styles.rowTitle}>{payment.receipt_number || payment.reference || 'Fee payment'}</Text><Text style={styles.subtle}>{formatShortDate(payment.createdAt)} · {payment.method.replace('_', ' ')}</Text>{payment.status_message ? <Text style={styles.subtle}>{payment.status_message}</Text> : null}</View><View style={styles.amountWrap}><Text style={styles.rowValue}>{payment.kind === 'REFUND' && payment.status === 'CONFIRMED' ? '−' : ''}{formatCurrency(asRupees(payment.amount_minor))}</Text><Text style={[styles.badge, payment.status === 'CONFIRMED' ? styles.badgePaid : styles.badgePending]}>{payment.status}</Text>{payment.kind === 'COLLECTION' && payment.status === 'CONFIRMED' ? <Pressable onPress={() => showReceipt(payment, selectedChild?.name || 'Student')}><Text style={styles.receiptLink}>Receipt</Text></Pressable> : null}</View></View>) : <Text style={styles.muted}>No payments have been recorded yet.</Text>}</View>
        {!fees.accounts.length ? <View style={styles.card}><Text style={styles.muted}>Your school has not assigned any fee accounts yet.</Text></View> : null}
      </ScrollView> : null}
    </ScreenShell>
  );
}

function Summary({ label, minor, accent = false }: { label: string; minor: number; accent?: boolean }) {
  return <View style={styles.summaryCard}><Text style={styles.caption}>{label}</Text><Text style={[styles.summaryValue, accent && styles.balance]}>{formatCurrency(asRupees(minor))}</Text></View>;
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 24 },
  center: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 10 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryCard: { minWidth: '47%', flexGrow: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface },
  caption: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  summaryValue: { marginTop: 7, color: palette.text, fontSize: 19, fontWeight: '800' },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface },
  accountHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  flex: { flex: 1 },
  cardTitle: { color: palette.text, fontSize: 17, fontWeight: '800' },
  subtle: { marginTop: 4, color: palette.muted, fontSize: 11 },
  balance: { marginTop: 4, color: palette.primary, fontSize: 19, fontWeight: '800' },
  progressTrack: { height: 7, marginTop: 17, overflow: 'hidden', borderRadius: 99, backgroundColor: palette.background },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: palette.primary },
  accountTotals: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 9 },
  accountTotalsText: { color: palette.muted, fontSize: 10 },
  sectionTitle: { marginTop: 18, marginBottom: 6, color: palette.text, fontSize: 15, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: palette.border },
  rowTitle: { color: palette.text, fontSize: 13, fontWeight: '700' },
  rowValue: { color: palette.text, fontSize: 13, fontWeight: '800' },
  amountWrap: { alignItems: 'flex-end', gap: 4 },
  badge: { overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, fontSize: 9, fontWeight: '800' },
  badgePaid: { backgroundColor: '#e4f8ee', color: '#168258' },
  badgePending: { backgroundColor: '#fff4dd', color: '#a36c09' },
  badgeOverdue: { backgroundColor: '#fff0ef', color: '#b63c42' },
  payButton: { alignItems: 'center', marginTop: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: palette.primary },
  payText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  onlineStatus: { marginTop: 13, color: palette.muted, fontSize: 11, textAlign: 'right' },
  receiptLink: { color: palette.primary, fontSize: 11, fontWeight: '800' },
  muted: { color: palette.muted, fontSize: 12 },
  errorCard: { padding: 16, borderWidth: 1, borderColor: '#f1cbce', borderRadius: 12, backgroundColor: '#fff6f6' },
  errorText: { color: '#a43f45', fontSize: 13 },
  retry: { alignSelf: 'flex-start', marginTop: 10, padding: 8 },
  retryText: { color: palette.primary, fontWeight: '800' },
});
