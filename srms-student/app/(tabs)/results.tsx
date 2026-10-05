import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { results } from '../../src/data/mockData';
import { palette } from '../../src/theme/theme';

export default function ResultsScreen() {
  return (
    <ScreenShell title="Results" subtitle="Annual Examination 2026">
      <View style={styles.summaryCard}>
        <Text style={styles.label}>Overall</Text>
        <Text style={styles.value}>85.8%</Text>
        <Text style={styles.grade}>Grade A</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton}><Text style={styles.actionText}>View Scorecard</Text></Pressable>
        <Pressable style={[styles.actionButton, styles.secondary]}><Text style={styles.actionTextSecondary}>Download</Text></Pressable>
      </View>

      <View style={styles.tableCard}>
        {results.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.remark}>{item.teacherRemark}</Text>
            </View>
            <Text style={styles.marks}>{item.marks}</Text>
            <Text style={styles.gradeBadge}>{item.grade}</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.muted} />
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: { backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 20 },
  label: { color: palette.muted, fontSize: 12, textTransform: 'uppercase' },
  value: { fontSize: 38, fontWeight: '700', color: palette.text, marginTop: 8 },
  grade: { marginTop: 8, color: palette.success, fontWeight: '700' },
  actionRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
  actionButton: { flex: 1, backgroundColor: palette.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  secondary: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
  actionText: { color: '#fff', fontWeight: '700' },
  actionTextSecondary: { color: palette.text, fontWeight: '700' },
  tableCard: { backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 12, marginTop: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: palette.border },
  subject: { fontSize: 16, fontWeight: '700', color: palette.text },
  remark: { marginTop: 4, fontSize: 12, color: palette.muted, maxWidth: 200 },
  marks: { fontWeight: '700', color: palette.text, marginRight: 14 },
  gradeBadge: { fontWeight: '700', color: palette.primary, minWidth: 34, textAlign: 'center', marginRight: 8 },
});
