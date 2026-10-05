import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { notifications } from '../../src/data/mockData';
import { palette } from '../../src/theme/theme';

export default function NotificationsScreen() {
  return (
    <ScreenShell title="Notifications" subtitle="Recent school updates">
      {notifications.map((item) => (
        <View key={item.id} style={[styles.card, item.unread && styles.unread]}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.time}>{item.timeAgo}</Text>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 16, marginBottom: 12 },
  unread: { borderColor: palette.primary, backgroundColor: '#eff6ff' },
  category: { color: palette.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 18, fontWeight: '700', color: palette.text, marginTop: 8 },
  description: { color: palette.muted, marginTop: 6 },
  time: { marginTop: 8, color: palette.muted, fontSize: 12 },
});
