import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SchoolBrand } from '../../src/models';
import { authService } from '../../src/services/authService';
import { useAppStore } from '../../src/store/app-store';
import { palette } from '../../src/theme/theme';

const features: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; background: string }[] = [
  { icon: 'stats-chart', label: 'Results', color: '#22a06b', background: '#dcfce7' },
  { icon: 'calendar', label: 'Attendance', color: '#2563eb', background: '#dbeafe' },
  { icon: 'wallet', label: 'Fees', color: '#d97706', background: '#fef3c7' },
  { icon: 'play-circle', label: 'Lessons', color: '#7c3aed', background: '#ede9fe' },
  { icon: 'document-text', label: 'Notes', color: '#e11d48', background: '#ffe4e6' },
  { icon: 'trending-up', label: 'Performance', color: '#0891b2', background: '#cffafe' },
  { icon: 'notifications', label: 'Notices', color: '#ca8a04', background: '#fef9c3' },
  { icon: 'person', label: 'Profile', color: '#2563eb', background: '#dbeafe' },
];

const rememberedStudentKey = 'srms_remembered_student_id';

const getRememberedStudentId = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(rememberedStudentKey) || '';
  } catch {
    return '';
  }
};

export function StudentLoginScreen() {
  const router = useRouter();
  const login = useAppStore((state) => state.login);
  const { width } = useWindowDimensions();
  const isWide = width >= 960;

  const [brand, setBrand] = useState<SchoolBrand | null>(null);
  const [studentId, setStudentId] = useState(getRememberedStudentId);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(Boolean(getRememberedStudentId()));
  const [loadingBrand, setLoadingBrand] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setBrand(null);
    setMessage('');

    setLoadingBrand(true);
    authService
      .getSchoolBrand()
      .then((school) => {
        if (active) setBrand(school);
      })
      .catch(() => {
        if (active) setBrand(null);
      })
      .finally(() => {
        if (active) setLoadingBrand(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async () => {
    setMessage('');
    if (!studentId.trim() || !password) {
      setMessage('Enter your student ID and password to continue.');
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        if (rememberMe) window.localStorage.setItem(rememberedStudentKey, studentId.trim());
        else window.localStorage.removeItem(rememberedStudentKey);
      } catch {
        // Continue login if browser storage is unavailable.
      }
    }

    setSubmitting(true);
    const success = await login('student', {
      studentId: studentId.trim(),
      password,
    });
    setSubmitting(false);

    if (success) {
      router.replace('/(tabs)');
      return;
    }
    setMessage('We could not verify those details. Check them and try again.');
  };

  const schoolName = brand?.name || 'Your School';
  const visibleFeatures = isWide ? features : features.slice(0, 4);
  const canSubmit = !submitting;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.shell, isWide ? styles.wideShell : styles.narrowShell]}>
            <View style={[styles.welcomePanel, isWide ? styles.wideWelcomePanel : styles.narrowWelcomePanel]}>
              {brand?.campusImageUrl ? (
                <ImageBackground
                  source={{ uri: brand.campusImageUrl }}
                  resizeMode="cover"
                  style={StyleSheet.absoluteFill}
                >
                  <View style={styles.imageWash} />
                </ImageBackground>
              ) : (
                <View pointerEvents="none" style={styles.artwork}>
                  <View style={styles.artworkCircleLarge} />
                  <View style={styles.artworkCircleSmall} />
                  <Ionicons name="school" size={isWide ? 220 : 130} color="rgba(37,99,235,0.10)" />
                  <View style={styles.artworkBook} />
                </View>
              )}

              <View style={styles.welcomeContent}>
                <View style={styles.brandRow}>
                  {brand?.logoUrl ? (
                    <Image source={{ uri: brand.logoUrl }} resizeMode="contain" style={styles.brandImage} />
                  ) : (
                    <View style={styles.brandIcon}>
                      <Ionicons name="school" size={27} color="#fff" />
                    </View>
                  )}
                  <View>
                    <Text style={styles.brandName}>SRMS</Text>
                    <Text style={styles.brandCaption}>Student Portal</Text>
                  </View>
                </View>

                <View style={styles.welcomeCopy}>
                  <View style={styles.goldRule} />
                  <Text style={styles.welcomeEyebrow}>WELCOME TO</Text>
                  <Text numberOfLines={2} style={[styles.schoolName, !isWide && styles.schoolNameCompact]}>
                    {schoolName}
                  </Text>
                  <Text style={styles.motto}>Learn  ·  Grow  ·  Achieve</Text>
                  <Text style={styles.welcomeDescription}>
                    Your results, attendance, fees, learning materials and school updates — all in one place.
                  </Text>
                </View>

                <View style={styles.featureGrid}>
                  {visibleFeatures.map((feature) => (
                    <View key={feature.label} style={styles.featureItem}>
                      <View style={[styles.featureIcon, { backgroundColor: feature.background }]}>
                        <Ionicons name={feature.icon} size={20} color={feature.color} />
                      </View>
                      <Text style={styles.featureLabel}>{feature.label}</Text>
                    </View>
                  ))}
                </View>

                {isWide ? (
                  <View style={styles.quoteWrap}>
                    <Text style={styles.quote}>Education today for a brighter tomorrow.</Text>
                    <View style={[styles.goldRule, styles.quoteRule]} />
                  </View>
                ) : null}
              </View>
            </View>

            <View style={[styles.loginPanel, isWide ? styles.wideLoginPanel : styles.narrowLoginPanel]}>
              <View style={styles.loginHeader}>
                <View style={styles.loginLogo}>
                  <Ionicons name="school" size={35} color="#fff" />
                </View>
                <Text style={styles.loginTitle}>SRMS Student Portal</Text>
                <Text style={styles.loginSubtitle}>Secure access for students</Text>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.label}>Student ID</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={19} color="#71829c" />
                  <TextInput
                    accessibilityLabel="Student ID or roll number"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setStudentId}
                    onSubmitEditing={handleLogin}
                    placeholder="Enter your student ID"
                    placeholderTextColor="#8a98ad"
                    returnKeyType="next"
                    style={styles.input}
                    value={studentId}
                  />
                </View>

                <Text style={[styles.label, styles.secondLabel]}>Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={19} color="#71829c" />
                  <TextInput
                    accessibilityLabel="Student password"
                    autoCapitalize="none"
                    onChangeText={setPassword}
                    onSubmitEditing={handleLogin}
                    placeholder="Enter your password"
                    placeholderTextColor="#8a98ad"
                    secureTextEntry
                    returnKeyType="go"
                    style={styles.input}
                    value={password}
                  />
                </View>

                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  disabled={submitting}
                  onPress={() => setRememberMe((current) => !current)}
                  style={styles.rememberRow}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe ? <Ionicons name="checkmark" size={13} color="#fff" /> : null}
                  </View>
                  <Text style={styles.rememberLabel}>Remember me</Text>
                </Pressable>

                {message ? <Text accessibilityRole="alert" style={styles.errorMessage}>{message}</Text> : null}
                <Pressable
                  accessibilityRole="button"
                  disabled={!canSubmit}
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.button,
                    !canSubmit && styles.buttonDisabled,
                    pressed && canSubmit && styles.buttonPressed,
                  ]}
                >
                  <Ionicons name="log-in-outline" size={19} color="#fff" />
                  <Text style={styles.buttonText}>{submitting ? 'Signing in…' : 'Login'}</Text>
                </Pressable>

                <Text style={styles.formHelper}>Use the student details recorded by your school.</Text>
              </View>

              <View style={styles.orDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.demoNotice}>
                <Ionicons name="information-circle-outline" size={17} color={palette.primary} />
                <Text style={styles.demoText}>
                  {loadingBrand ? 'Loading your school portal…' : brand ? `Welcome, ${brand.name}` : 'School branding appears automatically from your school link.'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function LegacyLoginRedirect() {
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf1fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  shell: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 7,
    borderColor: '#d8e7fa',
    borderRadius: 34,
    shadowColor: '#17345f',
    shadowOpacity: 0.14,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
    elevation: 9,
  },
  wideShell: {
    flexDirection: 'row',
    minHeight: 700,
  },
  narrowShell: {
    flexDirection: 'column',
    maxWidth: 620,
    borderWidth: 4,
    borderRadius: 26,
  },
  welcomePanel: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#eaf4ff',
  },
  wideWelcomePanel: {
    minHeight: 680,
    padding: 42,
  },
  narrowWelcomePanel: {
    minHeight: 290,
    padding: 22,
  },
  imageWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(239, 247, 255, 0.76)',
  },
  artwork: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#e6f2ff',
  },
  artworkCircleLarge: {
    position: 'absolute',
    width: 390,
    height: 390,
    borderRadius: 195,
    right: -140,
    top: -90,
    backgroundColor: 'rgba(59,130,246,0.09)',
  },
  artworkCircleSmall: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    left: -88,
    bottom: -65,
    backgroundColor: 'rgba(250,204,21,0.14)',
  },
  artworkBook: {
    position: 'absolute',
    width: 250,
    height: 16,
    borderRadius: 8,
    bottom: 30,
    right: 24,
    backgroundColor: 'rgba(29,78,216,0.12)',
    transform: [{ rotate: '-7deg' }],
  },
  welcomeContent: {
    flex: 1,
    zIndex: 1,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    shadowColor: palette.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  brandImage: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.84)',
  },
  brandName: {
    color: '#10234a',
    fontSize: 19,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandCaption: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  welcomeCopy: {
    marginTop: 34,
    marginBottom: 22,
    maxWidth: 530,
  },
  goldRule: {
    width: 58,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#f5bd25',
    marginBottom: 20,
  },
  welcomeEyebrow: {
    color: '#10234a',
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  schoolName: {
    color: '#2563eb',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.2,
    marginTop: -2,
  },
  schoolNameCompact: {
    fontSize: 30,
    lineHeight: 35,
  },
  motto: {
    color: '#1d4ed8',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  welcomeDescription: {
    color: '#526987',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 390,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 420,
    rowGap: 15,
  },
  featureItem: {
    alignItems: 'center',
    width: '25%',
    minWidth: 74,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    color: '#263b5d',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 5,
  },
  quoteWrap: {
    marginTop: 22,
    maxWidth: 280,
  },
  quote: {
    color: '#48617f',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 23,
  },
  quoteRule: {
    width: 70,
    height: 3,
    marginTop: 9,
    marginBottom: 0,
  },
  loginPanel: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  wideLoginPanel: {
    paddingHorizontal: 54,
    paddingVertical: 42,
  },
  narrowLoginPanel: {
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginLogo: {
    width: 74,
    height: 74,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    shadowColor: palette.primary,
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    marginBottom: 16,
  },
  loginTitle: {
    color: '#10234a',
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  loginSubtitle: {
    color: '#71829c',
    fontSize: 14,
    marginTop: 4,
  },
  formCard: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e7edf5',
    backgroundColor: '#fff',
    shadowColor: '#17345f',
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  label: {
    color: '#172b4d',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  secondLabel: {
    marginTop: 18,
  },
  rememberRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: 40,
    marginTop: 10,
    paddingVertical: 4,
    paddingRight: 12,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#a9b8cb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    borderColor: palette.primary,
    backgroundColor: palette.primary,
  },
  rememberLabel: {
    color: '#283a57',
    fontSize: 13,
    fontWeight: '500',
  },
  inputWrap: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#d9e3f0',
    backgroundColor: '#f8fafd',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#172b4d',
    fontSize: 14,
    outlineStyle: 'none' as never,
  },
  errorMessage: {
    color: '#b42318',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  schoolLinkHint: {
    color: '#7b8798',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  button: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 12,
    backgroundColor: palette.primary,
    marginTop: 22,
    shadowColor: palette.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  formHelper: {
    color: '#71829c',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 13,
  },
  orDivider: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 24,
    marginBottom: 17,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: '#dce5ef',
  },
  orText: {
    color: '#8392a8',
    fontSize: 11,
    fontWeight: '700',
  },
  demoNotice: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
  },
  demoText: {
    flexShrink: 1,
    color: palette.primary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
