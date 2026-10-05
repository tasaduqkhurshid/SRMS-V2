import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme, { palette } from '../theme/theme';

interface ScreenShellProps {
  title?: string;
  subtitle?: string;
  rightAction?: ReactNode;
  children: ReactNode;
}

export function ScreenShell({ title, subtitle, rightAction, children }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightAction ?? (
          <Pressable style={styles.iconButton} accessibilityLabel="Notifications" hitSlop={10}>
            <Ionicons name="notifications-outline" size={20} color={palette.text} />
          </Pressable>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    paddingBottom: 12,
    backgroundColor: palette.background,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  title: {
    fontSize: theme.typography.heading1.fontSize,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: palette.muted,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
});
