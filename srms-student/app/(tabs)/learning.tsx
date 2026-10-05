import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { learningMaterials } from '../../src/data/mockData';
import { palette } from '../../src/theme/theme';

export default function LearningScreen() {
  return (
    <ScreenShell title="Learning" subtitle="Study materials and videos">
      {learningMaterials.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.type}>{item.type.toUpperCase()}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.subject} • {item.chapter}</Text>
          <Text style={styles.meta}>Updated: {item.updatedAt}</Text>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 18, padding: 18, marginBottom: 12 },
  type: { color: palette.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: '700', color: palette.text, marginTop: 8 },
  meta: { color: palette.muted, marginTop: 6 },
});
