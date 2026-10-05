import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { useAppStore } from '../../src/store/app-store';
import { palette } from '../../src/theme/theme';

export default function ProfileScreen() {
  const selectedChild = useAppStore((state) => state.selectedChild());

  return (
    <ScreenShell title="Profile" subtitle="Student details">
      <View style={styles.headerCard}>
        <View style={styles.avatar}>{selectedChild?.avatar}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{selectedChild?.name}</Text>
          <Text style={styles.meta}>{selectedChild?.admissionNumber}</Text>
          <Text style={styles.meta}>{selectedChild?.className}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Text style={styles.item}>Guardian: {selectedChild?.guardianName}</Text>
        <Text style={styles.item}>Phone: {selectedChild?.phone}</Text>
        <Text style={styles.item}>Email: {selectedChild?.email}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        <Text style={styles.item}>Academic Year: {selectedChild?.academicYear}</Text>
        <Text style={styles.item}>Roll Number: {selectedChild?.rollNumber}</Text>
        <Text style={styles.item}>Grade: {selectedChild?.grade}</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 18 },
  avatar: { width: 64, height: 64, borderRadius: 18, backgroundColor: palette.primary, color: '#fff', textAlign: 'center', textAlignVertical: 'center', fontWeight: '700', marginRight: 14 },
  name: { fontSize: 22, fontWeight: '700', color: palette.text },
  meta: { marginTop: 2, color: palette.muted },
  sectionCard: { backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 18, marginTop: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 10 },
  item: { color: palette.text, marginBottom: 8 },
});
