import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/app-store';

export default function Index() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}
