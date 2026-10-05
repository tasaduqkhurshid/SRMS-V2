import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { palette } from '../../src/theme/theme';

const timetable = {
  Monday: ['Mathematics', 'Science', 'English'],
  Tuesday: ['Computer', 'History', 'Art'],
  Wednesday: ['Physics', 'Urdu', 'Islamiyat'],
};

export default function TimetableScreen() {
  return (
    <ScreenShell title="Timetable" subtitle="Weekly schedule">
      {Object.entries(timetable).map(([day, lessons]) => (
        <View key={day} style={styles.card}>
          <Text style={styles.day}>{day}</Text>
          {lessons.map((lesson, index) => (
            <View key={`${day}-${lesson}`} style={styles.lessonRow}>
              <Text style={styles.time}>{`${8 + index}:30`}</Text>
              <Text style={styles.lesson}>{lesson}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 18, marginBottom: 12 },
  day: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: palette.text },
  lessonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  time: { width: 52, color: palette.muted, fontWeight: '600' },
  lesson: { color: palette.text, fontWeight: '600' },
});
