import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { notices } from '../../src/data/mockData';
import { palette } from '../../src/theme/theme';

export default function NoticesScreen() {
  return (
    <ScreenShell title="Notices" subtitle="Latest announcements">
      {notices.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.priority} priority</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 18, marginBottom: 12 },
  category: { color: palette.secondary, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  title: { fontSize: 18, fontWeight: '700', color: palette.text, marginTop: 8 },
  meta: { marginTop: 6, color: palette.muted },
  description: { marginTop: 10, color: palette.text },
});
