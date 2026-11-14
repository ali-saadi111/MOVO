import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/i18n';
import { LaunchOverlay } from '@/features/loading/LaunchOverlay';
import { PreviewChrome } from '@/features/preview/PreviewChrome';
import { useSettingsHydrated } from '@/stores/settings';
import { useTheme } from '@/theme';
import { fontFiles } from '@/theme/fonts';
import { BannerHost } from '@/ui/banner';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: (n, e) => n < 1 && !(e instanceof Error && e.message === 'offline') } },
});

type Detents = number[];
const sheet = (detents: Detents = [0.6, 1]) =>
  Platform.OS === 'web'
    ? ({ presentation: 'transparentModal', animation: 'none', headerShown: false, contentStyle: { backgroundColor: 'transparent' } } as const)
    : ({ presentation: 'formSheet', sheetAllowedDetents: detents, sheetGrabberVisible: true, headerShown: false, sheetExpandsWhenScrolledToEdge: true } as const);
const cover = Platform.OS === 'web' ? ({ presentation: 'modal', animation: 'fade', headerShown: false } as const) : ({ presentation: 'fullScreenModal', headerShown: false } as const);


export default function RootLayout() {
  const t = useTheme();
  const settingsReady = useSettingsHydrated();
  const [fontsLoaded, fontError] = useFonts(fontFiles);
  const hydrated = settingsReady && (fontsLoaded || !!fontError);
  const nav = t.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = { ...nav, colors: { ...nav.colors, primary: t.colors.tint, background: t.colors.bgPrimary, card: t.colors.bgPrimary, text: t.colors.textPrimary, border: t.colors.separator } };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={navTheme}>
            <PreviewChrome>
              <View style={{ flex: 1, direction: t.rtl ? 'rtl' : 'ltr' }}>
                <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.bgPrimary } }}>
                  <Stack.Screen name="(onboarding)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="auth" options={Platform.OS === 'web' ? { presentation: 'transparentModal', animation: 'none', contentStyle: { backgroundColor: 'transparent' } } : { presentation: 'formSheet', sheetAllowedDetents: [1], sheetGrabberVisible: true }} />
                  <Stack.Screen name="sheets/map-filters" options={sheet([0.75, 1])} />
                  <Stack.Screen name="sheets/shop-filters" options={sheet([0.75, 1])} />
                  <Stack.Screen name="sheets/product-info" options={sheet([0.6, 1])} />
                  <Stack.Screen name="sheets/checkout-edit" options={sheet([0.6, 1])} />
                  <Stack.Screen name="sheets/care-edit" options={sheet([0.6, 1])} />
                  <Stack.Screen name="sheets/specialist-info" options={sheet([0.6, 1])} />
                  <Stack.Screen name="sheets/review" options={sheet([1])} />
                  <Stack.Screen name="sheets/report" options={sheet([1])} />
                  <Stack.Screen name="sheets/request-place" options={sheet([1])} />
                  <Stack.Screen name="sheets/why-this" options={sheet([0.55, 1])} />
                  <Stack.Screen name="sheets/support" options={sheet([1])} />
                  <Stack.Screen name="sheets/join" options={sheet([0.7, 1])} />
                  <Stack.Screen name="sheets/donate" options={sheet([0.85, 1])} />
                  <Stack.Screen name="sheets/confirm" options={sheet([0.35, 0.5])} />
                  <Stack.Screen name="sheets/return-request" options={sheet([1])} />
                  <Stack.Screen name="sheets/add-person" options={sheet([1])} />
                  <Stack.Screen name="sheets/delete-account" options={sheet([0.6, 1])} />
                  <Stack.Screen name="covers/payment" options={cover} />
                  <Stack.Screen name="covers/success" options={cover} />
                  <Stack.Screen name="covers/session-complete" options={cover} />
                  <Stack.Screen name="covers/photos" options={cover} />
                  <Stack.Screen name="dev/menu" options={sheet([0.75, 1])} />
                  <Stack.Screen name="dev/gallery" options={{ headerShown: true, title: 'Gallery' }} />
                </Stack>
                <BannerHost />
                {/* The navigator renders from the first frame so deep links survive; this covers it until saved settings load. */}
                {!hydrated ? <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.colors.bgPrimary }} /> : null}
                {/* The MOVO drawing at launch, over the app until it is ready and the logo is drawn. */}
                <LaunchOverlay appReady={hydrated} />
              </View>
            </PreviewChrome>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
