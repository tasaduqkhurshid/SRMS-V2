import { Redirect } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';

export default function TabsIndexRedirect() {
  const authMode = useAppStore((state) => state.authMode);
  return <Redirect href={authMode === 'parent' ? '/(tabs)/fees' : '/dashboard'} />;
}
