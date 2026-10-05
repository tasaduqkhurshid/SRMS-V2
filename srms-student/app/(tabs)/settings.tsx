import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { palette } from '../../src/theme/theme';

const settings = ['Account', 'Notifications', 'Language', 'Security', 'Appearance', 'About School'];

export default function SettingsScreen() {
  return (
    <ScreenShell title="Settings" subtitle="Profile and preferences">
      {settings.map((item) => (
        <View key={item} style={styles.row}>
          <Text style={styles.label}>{item}</Text>
          <Text style={styles.value}>Configured</Text>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: palette.text, fontWeight: '600' },
  value: { color: palette.muted, fontSize: 12 },
});
