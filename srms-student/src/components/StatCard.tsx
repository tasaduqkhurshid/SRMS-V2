import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/theme';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent?: string;
  onPress?: () => void;
  actionLabel?: string;
  children?: ReactNode;
}

export function StatCard({ title, value, subtitle, icon, accent = palette.primary, onPress, actionLabel, children }: StatCardProps) {
  const content = (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}14` }]}> 
          <Ionicons name={icon} size={18} color={accent} />
        </View>
        {actionLabel ? (
          <Pressable style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    minHeight: 140,
    shadowColor: palette.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    marginTop: 6,
    color: palette.muted,
    fontSize: 13,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: palette.background,
  },
  buttonText: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
