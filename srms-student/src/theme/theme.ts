export const palette = {
  primary: '#1d4ed8',
  secondary: '#0f766e',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  background: '#f3f7fb',
  surface: '#ffffff',
  card: '#f8fafc',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  shadow: '#0f172a1a',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radius = {
  small: 10,
  medium: 16,
  large: 24,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  heading1: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  heading2: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  heading3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  caption: { fontSize: 11, lineHeight: 16, fontWeight: '500' as const },
};

export const theme = {
  colors: palette,
  spacing,
  radius,
  typography,
};

export default theme;
