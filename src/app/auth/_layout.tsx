import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { useTheme } from '@/theme';

export default function AuthLayout() {
  const t = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Platform.OS === 'web' ? 'transparent' : t.colors.bgElevated } }} />;
}
