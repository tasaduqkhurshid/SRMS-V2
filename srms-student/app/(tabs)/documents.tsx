import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { palette } from '../../src/theme/theme';

const documents = ['Birth Certificate', 'Student ID', 'Bonafide Certificate'];

export default function DocumentsScreen() {
  return (
    <ScreenShell title="Documents" subtitle="Secure document library">
      {documents.map((document) => (
        <View key={document} style={styles.card}>
          <Text style={styles.name}>{document}</Text>
          <Text style={styles.meta}>Protected access • Available to authorized users</Text>
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
    marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: '700', color: palette.text },
  meta: { marginTop: 6, color: palette.muted },
});
