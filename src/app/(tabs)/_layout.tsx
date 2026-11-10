import { Redirect } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { cartCount, useCart } from '@/stores/cart';
import { useDev } from '@/stores/dev';
import { useSettings, useSettingsHydrated } from '@/stores/settings';
import { springs, useTheme } from '@/theme';
import { Pressable, Text } from '@/ui';
import { LiquidGlassFill } from '@/ui/LiquidGlass';
import { TabIcon, type TabGlyph } from '@/ui/TabIcon';
import { TAB_BAR } from '@/ui/nav';

/**
 * Movo's floating tab bar: a Liquid Glass capsule (expo-glass-effect on iOS 26,
 * liquid-glass-react in the web preview) with Movo's own icons and a label under
 * each. The selected tab gets a lighter glass pill and a mint-filled icon.
 * Build Brief tabs by default; the dev menu's Home flag swaps to the App Experience set.
 */
export default function TabsLayout() {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const onboarded = useSettings((s) => s.onboarded);
  const hydrated = useSettingsHydrated();
  const home = useDev((s) => s.homeTab);
  const count = useCart((s) => cartCount(s.lines));
  const [w, setW] = useState(0);
  if (hydrated && !onboarded) return <Redirect href="/language" />;
  const tabs: { name: string; href: string; label: string; glyph: TabGlyph; badge?: number }[] = [
    ...(home ? [{ name: '(home)', href: '/(tabs)/(home)/home', label: tr('tab.home', 'Home'), glyph: 'home' as const }] : []),
    { name: '(map)', href: '/(tabs)/(map)', label: tr('tab.map', 'Map'), glyph: 'map' },
    { name: '(shop)', href: '/(tabs)/(shop)/shop', label: tr('tab.shop', 'Shop'), glyph: 'shop', badge: count },
    { name: '(care)', href: '/(tabs)/(care)/care', label: tr('tab.care', 'Care'), glyph: 'care' },
    ...(!home ? [{ name: '(community)', href: '/(tabs)/(community)/community', label: tr('tab.community', 'Community'), glyph: 'community' as const }] : []),
    { name: '(profile)', href: '/(tabs)/(profile)/profile', label: tr('tab.profile', 'Profile'), glyph: 'profile' },
  ];
  const radius = TAB_BAR.height / 2;
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}
        style={{ position: 'absolute', zIndex: 50, bottom: TAB_BAR.offset(insets.bottom), left: 16, right: 16, height: TAB_BAR.height, padding: 5, borderRadius: radius, flexDirection: 'row', alignItems: 'center', boxShadow: '0 14px 36px rgba(1,30,41,0.18), 0 2px 8px rgba(1,30,41,0.08)' }}>
        <LiquidGlassFill width={w} height={TAB_BAR.height} radius={radius} tint={0.7} />
        {tabs.map((tab) => (
          <TabTrigger key={tab.name} name={tab.name} href={tab.href as never} resetOnFocus={tab.name === '(map)'} asChild>
            <TabButton label={tab.label} glyph={tab.glyph} badge={tab.badge} />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

const TabButton = forwardRef<View, TabTriggerSlotProps & { label: string; glyph: TabGlyph; badge?: number }>(function TabButton({ isFocused, label, glyph, badge, ...props }, ref) {
  const t = useTheme();
  const dark = t.scheme === 'dark';
  const on = useSharedValue(isFocused ? 1 : 0);
  const bump = useSharedValue(1);
  useEffect(() => {
    on.value = withSpring(isFocused ? 1 : 0, t.reduceMotion ? springs.smooth : springs.bouncy);
  }, [isFocused, on, t.reduceMotion]);
  useEffect(() => {
    if (badge && !t.reduceMotion) bump.value = withSequence(withSpring(1.35, springs.snappy), withSpring(1, springs.bouncy));
  }, [badge, bump, t.reduceMotion]);
  const pill = useAnimatedStyle(() => ({ opacity: on.value, transform: [{ scaleX: 0.6 + on.value * 0.4 }, { scaleY: 0.8 + on.value * 0.2 }] }));
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: -on.value * 1 }, { scale: 1 + on.value * 0.06 }] }));
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));
  const ink = isFocused ? (dark ? '#3CF2B8' : '#013447') : dark ? 'rgba(255,255,255,0.74)' : '#46565E';
  const fill = dark ? 'rgba(60,242,184,0.28)' : '#3CE0AA';
  return (
    <Pressable ref={ref as never} {...props} feedback="scale" accessibilityRole="tab" accessibilityLabel={badge ? `${label}, ${badge}` : label} accessibilityState={{ selected: isFocused }} style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 1, right: 1, borderRadius: 999, backgroundColor: dark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.78)', boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,0.18)' : '0 2px 10px rgba(1,52,71,0.10), inset 0 1px 0 #FFFFFF' }, pill]} />
      <Animated.View style={[{ alignItems: 'center', gap: 2 }, lift]}>
        <TabIcon name={glyph} on={!!isFocused} ink={ink} fill={fill} size={24} />
        <Text variant="caption2" weight={isFocused ? '700' : '500'} numberOfLines={1} maxFontSizeMultiplier={1.2} style={{ color: ink, fontSize: 10.5, letterSpacing: 0.1 }}>{label}</Text>
      </Animated.View>
      {badge ? (
        <Animated.View style={[{ position: 'absolute', top: 5, right: '20%', minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#E5484D', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: dark ? '#1C2B31' : '#FFFFFF' }, badgeStyle]}>
          <Text variant="caption2" weight="700" style={{ color: '#FFFFFF', fontSize: 10 }} maxFontSizeMultiplier={1.2}>{badge}</Text>
        </Animated.View>
      ) : null}
    </Pressable>
  );
});
