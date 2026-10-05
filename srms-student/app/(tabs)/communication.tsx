import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { palette } from '../../src/theme/theme';

const messages = [
  { teacher: 'Mr. Amir', subject: 'Mathematics', message: 'Your revision plan is on track. Please complete the chapter review by Friday.' },
  { teacher: 'Ms. Sana', subject: 'English', message: 'Please prepare for the speaking activity next week.' },
];

export default function CommunicationScreen() {
  return (
    <ScreenShell title="Communication" subtitle="School and teacher messages">
      {messages.map((item) => (
        <View key={item.teacher} style={styles.card}>
          <Text style={styles.teacher}>{item.teacher}</Text>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={styles.message}>{item.message}</Text>
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
  teacher: { fontSize: 18, fontWeight: '700', color: palette.text },
  subject: { marginTop: 4, color: palette.primary, fontWeight: '700' },
  message: { marginTop: 8, color: palette.text },
});
