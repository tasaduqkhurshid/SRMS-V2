import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { palette } from '../../src/theme/theme';

const moreItems = [
  { label: 'Exams', href: '/(tabs)/exams' },
  { label: 'Performance', href: '/(tabs)/performance' },
  { label: 'Homework', href: '/(tabs)/homework' },
  { label: 'Learning', href: '/(tabs)/learning' },
  { label: 'Notifications', href: '/(tabs)/notifications' },
  { label: 'Notices', href: '/(tabs)/notices' },
  { label: 'Timetable', href: '/(tabs)/timetable' },
  { label: 'Documents', href: '/(tabs)/documents' },
  { label: 'Communication', href: '/(tabs)/communication' },
  { label: 'Settings', href: '/(tabs)/settings' },
];

export default function MoreScreen() {
  return (
    <ScreenShell title="More" subtitle="Additional student services">
      {moreItems.map((item) => (
        <Link key={item.label} href={item.href as any} style={styles.linkCard}>
          <Text style={styles.linkText}>{item.label}</Text>
        </Link>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  linkCard: { backgroundColor: palette.surface, borderRadius: 16, borderWidth: 1, borderColor: palette.border, padding: 18, marginBottom: 12 },
  linkText: { color: palette.text, fontSize: 16, fontWeight: '700' },
});
