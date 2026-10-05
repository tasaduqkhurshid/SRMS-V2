import { Slot, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/app-store';
import { palette } from '../../src/theme/theme';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'home-outline' },
  { key: 'attendance', label: 'Attendance', href: '/(tabs)/attendance', icon: 'calendar-outline' },
  { key: 'results', label: 'Results', href: '/(tabs)/results', icon: 'clipboard-outline' },
  { key: 'fees', label: 'Fees', href: '/(tabs)/fees', icon: 'wallet-outline' },
  { key: 'performance', label: 'Performance', href: '/(tabs)/performance', icon: 'trending-up-outline' },
  { key: 'profile', label: 'Profile', href: '/(tabs)/profile', icon: 'person-outline' },
  { key: 'more', label: 'More', href: '/(tabs)/more', icon: 'ellipsis-horizontal-outline' },
] as const;

const moreSubmenuItems = [
  { key: 'exams', label: 'Exams', href: '/(tabs)/exams' },
  { key: 'homework', label: 'Homework', href: '/(tabs)/homework' },
  { key: 'learning', label: 'Learning', href: '/(tabs)/learning' },
  { key: 'notifications', label: 'Notifications', href: '/(tabs)/notifications' },
  { key: 'notices', label: 'Notices', href: '/(tabs)/notices' },
  { key: 'timetable', label: 'Timetable', href: '/(tabs)/timetable' },
  { key: 'documents', label: 'Documents', href: '/(tabs)/documents' },
  { key: 'communication', label: 'Communication', href: '/(tabs)/communication' },
  { key: 'settings', label: 'Settings', href: '/(tabs)/settings' },
] as const;

export default function TabLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const school = useAppStore((state) => state.school);
  const selectedChild = useAppStore((state) => state.selectedChild());
  const logout = useAppStore((state) => state.logout);

  const currentRouteKey = segments.at(-1) ?? 'dashboard';
  const normalizedCurrentRouteKey = currentRouteKey === 'index' || currentRouteKey === '(tabs)' ? 'dashboard' : currentRouteKey;
  const studentName = selectedChild?.name ?? 'Student';

  const navigate = (href: string) => {
    router.push(href as never);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={[styles.sidebar, !isSidebarOpen && styles.sidebarCollapsed]}>
          <View style={styles.sidebarHeader}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>{school.logo}</Text>
            </View>
            {isSidebarOpen && (
              <View style={styles.brandTextWrap}>
                <Text style={styles.brandName}>{school.name}</Text>
                <Text style={styles.brandTag}>Student portal</Text>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsSidebarOpen((value) => !value)}
              style={styles.collapseButton}
            >
              <Ionicons name="menu-outline" size={22} color={palette.text} />
            </Pressable>
          </View>

          <View style={styles.navList}>
            {navItems.map((item) => {
              const isActive = normalizedCurrentRouteKey === item.key;

              if (item.key === 'more') {
                return (
                  <View key={item.key} style={styles.moreGroup}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setIsMoreOpen((value) => !value)}
                      style={[styles.navItem, isActive && styles.navItemActive, !isSidebarOpen && styles.navItemCollapsed]}
                    >
                      <Ionicons name={item.icon} size={20} color={isActive ? '#fff' : palette.muted} />
                      {isSidebarOpen && <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>}
                    </Pressable>

                    {isSidebarOpen && isMoreOpen && (
                      <View style={styles.submenuList}>
                        {moreSubmenuItems.map((subItem) => {
                          const isSubItemActive = normalizedCurrentRouteKey === subItem.key;

                          return (
                            <Pressable
                              key={subItem.key}
                              accessibilityRole="button"
                              onPress={() => navigate(subItem.href)}
                              style={[styles.submenuItem, isSubItemActive && styles.submenuItemActive]}
                            >
                              <Text style={[styles.submenuText, isSubItemActive && styles.submenuTextActive]}>{subItem.label}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              }

              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  onPress={() => {
                    setIsMoreOpen(false);
                    navigate(item.href);
                  }}
                  style={[styles.navItem, isActive && styles.navItemActive, !isSidebarOpen && styles.navItemCollapsed]}
                >
                  <Ionicons name={item.icon} size={20} color={isActive ? '#fff' : palette.muted} />
                  {isSidebarOpen && <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sidebarFooter}>
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={18} color={palette.text} />
              {isSidebarOpen && <Text style={styles.logoutText}>Log out</Text>}
            </Pressable>
          </View>
        </View>

        <View style={styles.mainArea}>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerBanner}>{school.name}</Text>
              <Text style={styles.headerEyebrow}>Welcome back</Text>
              <Text style={styles.headerTitle}>{studentName}</Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable accessibilityRole="button" style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={22} color={palette.text} />
                <View style={styles.notificationDot} />
              </Pressable>
            </View>
          </View>

          <View style={styles.contentArea}>
            <Slot />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© {new Date().getFullYear()} {school.name}. All rights reserved.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: palette.background,
  },
  sidebar: {
    width: 248,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: palette.border,
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },
  sidebarCollapsed: {
    width: 88,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 22,
  },
  brandBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  brandTextWrap: {
    flex: 1,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
  },
  brandTag: {
    fontSize: 11,
    color: palette.muted,
    marginTop: 2,
  },
  collapseButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  navList: {
    gap: 8,
  },
  moreGroup: {
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: palette.primary,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navLabel: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#fff',
  },
  submenuList: {
    marginLeft: 18,
    gap: 4,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: palette.border,
  },
  submenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: palette.card,
  },
  submenuItemActive: {
    backgroundColor: `${palette.primary}14`,
  },
  submenuText: {
    fontSize: 12,
    color: palette.text,
    fontWeight: '600',
  },
  submenuTextActive: {
    color: palette.primary,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: palette.card,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
  },
  mainArea: {
    flex: 1,
  },
  header: {
    minHeight: 110,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  headerBanner: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headerEyebrow: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: palette.danger,
    borderWidth: 2,
    borderColor: '#fff',
  },
  contentArea: {
    flex: 1,
    padding: 18,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});
