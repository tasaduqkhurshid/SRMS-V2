import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../src/components/ScreenShell';
import { StatCard } from '../src/components/StatCard';
import { notifications, notices } from '../src/data/mockData';
import { useAppStore } from '../src/store/app-store';
import { formatCurrency, formatPercent, formatShortDate } from '../src/utils/formatters';
import { palette } from '../src/theme/theme';

export default function DashboardScreen() {
  const selectedChild = useAppStore((state) => state.selectedChild());
  const setSelectedChild = useAppStore((state) => state.setSelectedChild);
  const parent = useAppStore((state) => state.parent);

  return (
    <ScreenShell title="Dashboard" subtitle="Good morning, Ali 👋">
      <View style={styles.topCard}>
        <View style={styles.childRow}>
          <Text style={styles.name}>{selectedChild?.name}</Text>
          <Text style={styles.badge}>{selectedChild?.grade}</Text>
        </View>
        <Text style={styles.meta}>{selectedChild?.className}</Text>
        <Text style={styles.meta}>Academic Year {selectedChild?.academicYear}</Text>
      </View>

      <View style={styles.childrenSelector}>
        {parent.children.map((child) => (
          <Pressable
            key={child.id}
            onPress={() => setSelectedChild(child.id)}
            style={[styles.childButton, child.id === selectedChild?.id && styles.childButtonActive]}
          >
            <Text style={[styles.childButtonText, child.id === selectedChild?.id && styles.childButtonTextActive]}>{child.name}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.grid}>
        <StatCard title="Attendance" value={formatPercent(selectedChild?.attendance ?? 0)} subtitle="+3% from last month" icon="calendar" accent={palette.success} />
        <StatCard title="Performance" value={formatPercent(selectedChild?.performance ?? 0)} subtitle="Strong momentum" icon="trending-up" accent={palette.primary} />
        <StatCard title="Pending Fee" value={formatCurrency(selectedChild?.pendingFee ?? 0)} subtitle="Payable before 20 Oct" icon="wallet" accent={palette.warning} />
        <StatCard title="Next Exam" value={selectedChild?.nextExam ?? 'Mathematics'} subtitle={selectedChild?.nextExamDate ? formatShortDate(selectedChild.nextExamDate).toString() : '12 Oct'} icon="book" accent={palette.secondary} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Exams</Text>
        <Link href="/(tabs)/results" style={styles.linkText}>View</Link>
      </View>
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Mathematics</Text>
        <Text style={styles.listMeta}>Annual Examination • 12 October 2026</Text>
        <Text style={styles.listMeta}>Room 12 • 10:00 AM</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Notices</Text>
        <Link href="/(tabs)/notices" style={styles.linkText}>All</Link>
      </View>
      {notices.map((notice) => (
        <View key={notice.id} style={styles.listCard}>
          <Text style={styles.listTitle}>{notice.title}</Text>
          <Text style={styles.listMeta}>{notice.category} • {notice.priority}</Text>
          <Text style={styles.listMeta}>{formatShortDate(notice.date)}</Text>
        </View>
      ))}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest Learning</Text>
        <Link href="/(tabs)/more" style={styles.linkText}>Open</Link>
      </View>
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>📄 Mathematics Notes</Text>
        <Text style={styles.listMeta}>Quadratic Equations</Text>
        <Text style={styles.listMeta}>Updated 05 Oct 2026</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Link href="/(tabs)/notifications" style={styles.linkText}>See all</Link>
      </View>
      {notifications.slice(0, 2).map((item) => (
        <View key={item.id} style={styles.activityRow}>
          <View style={styles.dot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <Text style={styles.listMeta}>{item.description}</Text>
          </View>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topCard: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  childRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 24, fontWeight: '700', color: palette.text },
  badge: { backgroundColor: `${palette.primary}14`, color: palette.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontWeight: '700' },
  meta: { marginTop: 4, color: palette.muted, fontSize: 14 },
  childrenSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  childButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
  childButtonActive: { backgroundColor: `${palette.primary}14`, borderColor: palette.primary },
  childButtonText: { color: palette.text, fontWeight: '600' },
  childButtonTextActive: { color: palette.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  sectionHeader: { marginTop: 22, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
  linkText: { color: palette.primary, fontWeight: '600' },
  listCard: { backgroundColor: palette.surface, borderRadius: 16, borderWidth: 1, borderColor: palette.border, padding: 14, marginBottom: 12 },
  listTitle: { fontSize: 16, fontWeight: '700', color: palette.text },
  listMeta: { marginTop: 4, color: palette.muted, fontSize: 13 },
  activityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, borderRadius: 14, borderWidth: 1, borderColor: palette.border, padding: 12, marginBottom: 10 },
  activityTitle: { color: palette.text, fontWeight: '600', marginBottom: 2 },
  dot: { width: 10, height: 10, borderRadius: 999, backgroundColor: palette.primary, marginRight: 10 },
});
