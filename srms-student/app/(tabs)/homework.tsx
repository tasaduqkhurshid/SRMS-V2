import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { homework } from '../../src/data/mockData';
import { palette } from '../../src/theme/theme';

export default function HomeworkScreen() {
  return (
    <ScreenShell title="Homework" subtitle="Assignments and work due">
      {homework.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>Due: {item.dueDate}</Text>
          <Text style={[styles.status, item.status === 'Pending' ? styles.pending : item.status === 'Submitted' ? styles.submitted : styles.overdue]}>{item.status}</Text>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 18, padding: 18, marginBottom: 12 },
  subject: { color: palette.primary, fontWeight: '700', marginBottom: 6 },
  title: { color: palette.text, fontSize: 18, fontWeight: '700' },
  meta: { marginTop: 8, color: palette.muted },
  status: { marginTop: 12, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, fontWeight: '700', overflow: 'hidden' },
  pending: { backgroundColor: `${palette.warning}22`, color: palette.warning },
  submitted: { backgroundColor: `${palette.success}22`, color: palette.success },
  overdue: { backgroundColor: `${palette.danger}18`, color: palette.danger },
});
