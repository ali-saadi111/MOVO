import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { useTheme } from '@/theme';

export const unstable_settings = {
  '(home)': { initialRouteName: 'home' },
  '(map)': { initialRouteName: 'index' },
  '(shop)': { initialRouteName: 'shop' },
  '(care)': { initialRouteName: 'care' },
  '(community)': { initialRouteName: 'community' },
  '(profile)': { initialRouteName: 'profile' },
};

/** One native stack per tab, shared routes (place, product, event…) in each. */
export default function TabStack({ segment }: { segment: string }) {
  const t = useTheme();
  const web = Platform.OS === 'web';
  return (
    <Stack
      screenOptions={{
        headerShown: !web,
        headerTintColor: t.colors.tint,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: t.colors.bgPrimary },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
