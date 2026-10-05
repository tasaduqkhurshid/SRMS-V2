import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => undefined);
    }
  }, []);

  return (
    <>
      <Head><link rel="manifest" href="/manifest.json" /></Head>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
