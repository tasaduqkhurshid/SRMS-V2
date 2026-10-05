import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { palette } from '../../src/theme/theme';

const trend = [78, 82, 88];

export default function PerformanceScreen() {
  return (
    <ScreenShell title="Performance" subtitle="Subject and exam progress">
      <View style={styles.card}>
        <Text style={styles.title}>Performance Trend</Text>
        <View style={styles.chart}>
          {trend.map((value, index) => (
            <View key={value + index} style={styles.barWrap}>
              <View style={[styles.bar, { height: value * 1.6 }]} />
              <Text style={styles.barLabel}>{['1st Term', 'Mid Term', 'Final'][index]}</Text>
              <Text style={styles.barValue}>{value}%</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Strong Subjects</Text>
        <Text style={styles.item}>Mathematics</Text>
        <Text style={styles.item}>Science</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Needs Improvement</Text>
        <Text style={styles.item}>English</Text>
      </View>
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
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 16 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160 },
  barWrap: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  bar: { width: '100%', maxWidth: 40, backgroundColor: palette.primary, borderRadius: 10, minHeight: 28 },
  barLabel: { marginTop: 8, color: palette.muted, fontSize: 11 },
  barValue: { marginTop: 4, color: palette.text, fontWeight: '700' },
  item: { color: palette.text, marginBottom: 8, fontWeight: '600' },
});
