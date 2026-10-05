import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { palette } from '../../src/theme/theme';

const exams = [
  { subject: 'Mathematics', name: 'Annual Examination', date: '12 October 2026', time: '10:00 AM', location: 'Room 12' },
  { subject: 'Science', name: 'Unit Test', date: '18 October 2026', time: '09:30 AM', location: 'Lab 3' },
];

export default function ExamsScreen() {
  return (
    <ScreenShell title="Exams" subtitle="Upcoming exam schedule">
      {exams.map((exam) => (
        <View key={exam.subject} style={styles.card}>
          <Text style={styles.subject}>{exam.subject}</Text>
          <Text style={styles.name}>{exam.name}</Text>
          <Text style={styles.meta}>{exam.date}</Text>
          <Text style={styles.meta}>{exam.time}</Text>
          <Text style={styles.meta}>{exam.location}</Text>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    marginBottom: 14,
  },
  subject: { color: palette.primary, fontWeight: '700', fontSize: 16 },
  name: { marginTop: 6, color: palette.text, fontSize: 18, fontWeight: '700' },
  meta: { marginTop: 4, color: palette.muted },
});
