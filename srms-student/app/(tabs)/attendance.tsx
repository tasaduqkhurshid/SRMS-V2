import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { palette } from '../../src/theme/theme';
import { formatPercent } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/app-store';

const attendanceHistory = [
  { date: 'Mon', present: true },
  { date: 'Tue', present: true },
  { date: 'Wed', present: false },
  { date: 'Thu', present: true },
  { date: 'Fri', present: true },
  { date: 'Sat', present: true },
  { date: 'Sun', present: false },
];

export default function AttendanceScreen() {
  const selectedChild = useAppStore((state) => state.selectedChild());

  return (
    <ScreenShell title="Attendance" subtitle="Monthly overview">
      <View style={styles.summaryCard}>
        <Text style={styles.bigValue}>{formatPercent(selectedChild?.attendance ?? 0)}</Text>
        <View style={styles.row}>
          <View style={styles.metric}> <Text style={styles.metricLabel}>Present</Text><Text style={styles.metricValue}>220</Text></View>
          <View style={styles.metric}> <Text style={styles.metricLabel}>Absent</Text><Text style={styles.metricValue}>12</Text></View>
          <View style={styles.metric}> <Text style={styles.metricLabel}>Leave</Text><Text style={styles.metricValue}>5</Text></View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.calendarGrid}>
          {attendanceHistory.map((item) => (
            <View key={item.date} style={styles.dayCell}>
              <Text style={styles.day}>{item.date}</Text>
              <View style={[styles.dayStatus, item.present ? styles.present : styles.absent]}>
                <Ionicons name={item.present ? 'checkmark' : 'close'} size={14} color="#fff" />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Subject-wise Attendance</Text>
        {[
          ['Mathematics', 94],
          ['Science', 90],
          ['English', 88],
        ].map(([subject, value]) => (
          <View key={subject} style={styles.subjectRow}>
            <Text style={styles.subject}>{subject}</Text>
            <Text style={styles.subjectValue}>{value}%</Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: { backgroundColor: palette.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: palette.border },
  bigValue: { fontSize: 42, fontWeight: '700', color: palette.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  metric: { flex: 1, alignItems: 'center' },
  metricLabel: { color: palette.muted, fontSize: 12 },
  metricValue: { fontSize: 20, fontWeight: '700', color: palette.text, marginTop: 4 },
  sectionCard: { backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 18, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 12 },
  calendarGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { alignItems: 'center', flex: 1 },
  day: { color: palette.muted, marginBottom: 8, fontSize: 12 },
  dayStatus: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  present: { backgroundColor: palette.success },
  absent: { backgroundColor: palette.warning },
  subjectRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  subject: { color: palette.text, fontWeight: '600' },
  subjectValue: { color: palette.primary, fontWeight: '700' },
});
