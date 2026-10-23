import { Image, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { ScreenShell } from '../../src/components/ScreenShell';
import { useAppStore } from '../../src/store/app-store';
import { palette } from '../../src/theme/theme';
import { ApiClient } from '../../src/api/ApiClient';

export default function ProfileScreen() {
  const selectedChild = useAppStore((state) => state.selectedChild());
  const authMode = useAppStore((state) => state.authMode);
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => { setPhotoFailed(false); }, [selectedChild?.id, authMode]);
  const photoPath = `/api/student/profile/photo${authMode === 'parent' && selectedChild?.id ? `?student_id=${encodeURIComponent(selectedChild.id)}` : ''}`;
  const photoSource = !photoFailed ? {
    uri: ApiClient.resolveAssetUri(photoPath),
    headers: ApiClient.getToken() ? { Authorization: `Bearer ${ApiClient.getToken()}` } : undefined,
  } : null;

  return (
    <ScreenShell title="Profile" subtitle="Student details">
      <View style={styles.headerCard}>
        {photoSource ? <Image source={photoSource} onError={() => setPhotoFailed(true)} resizeMode="cover" style={styles.avatarImage} /> : <View style={styles.avatar}><Text style={styles.avatarText}>{selectedChild?.avatar}</Text></View>}
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
  avatar: { width: 64, height: 64, borderRadius: 18, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { color: '#fff', fontWeight: '700' },
  avatarImage: { width: 64, height: 64, borderRadius: 18, marginRight: 14, backgroundColor: palette.border },
  name: { fontSize: 22, fontWeight: '700', color: palette.text },
  meta: { marginTop: 2, color: palette.muted },
  sectionCard: { backgroundColor: palette.surface, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 18, marginTop: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 10 },
  item: { color: palette.text, marginBottom: 8 },
});
