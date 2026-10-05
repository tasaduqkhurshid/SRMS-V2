import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { palette } from '../../src/theme/theme';
import { formatCurrency } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/app-store';

export default function FeesScreen() {
  const selectedChild = useAppStore((state) => state.selectedChild());
  const totalFee = 30000;
  const paid = totalFee - (selectedChild?.pendingFee ?? 0);
  const progress = Math.round((paid / totalFee) * 100);

  return (
    <ScreenShell title="Fees" subtitle="Financial overview">
      <View style={styles.summaryCard}>
        <Text style={styles.label}>Total Fee</Text>
        <Text style={styles.value}>{formatCurrency(totalFee)}</Text>
        <Text style={styles.subtle}>Paid {formatCurrency(paid)} • Pending {formatCurrency(selectedChild?.pendingFee ?? 0)}</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
        <Text style={styles.progressText}>{progress}% Paid</Text>
      </View>

      <Pressable style={[styles.payButton, { opacity: 0.8 }]}>
        <Text style={styles.payButtonText}>Online payment coming soon</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Fee Structure</Text>
        {[
          { label: 'Tuition Fee', amount: 12000 },
          { label: 'Transport', amount: 6000 },
          { label: 'Examination', amount: 5000 },
          { label: 'Activity', amount: 4000 },
          { label: 'Other', amount: 3000 },
        ].map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowValue}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: { backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 20 },
  label: { color: palette.muted, fontSize: 12, textTransform: 'uppercase' },
  value: { fontSize: 34, fontWeight: '700', color: palette.text, marginTop: 8 },
  subtle: { marginTop: 8, color: palette.muted },
  progressTrack: { height: 12, borderRadius: 999, backgroundColor: palette.background, marginTop: 18, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: palette.primary, borderRadius: 999 },
  progressText: { marginTop: 10, color: palette.primary, fontWeight: '700' },
  payButton: { marginTop: 16, backgroundColor: palette.secondary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  payButtonText: { color: '#fff', fontWeight: '700' },
  card: { marginTop: 18, backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: palette.border },
  rowLabel: { color: palette.text, fontWeight: '600' },
  rowValue: { color: palette.primary, fontWeight: '700' },
});
