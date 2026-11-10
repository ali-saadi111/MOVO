import { useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { announce } from '@/lib/a11y';
import { haptic } from '@/lib/haptics';
import { continuous, layout, radii, space, springs, useTheme } from '@/theme';
import { Icon } from './Icon';
import { Pressable } from './Pressable';
import type { IconName } from './symbols';
import { Text } from './Text';

export type BannerTone = 'navy' | 'mint' | 'sand';
type Banner = { id: number; title: string; body?: string; icon: IconName; tone?: BannerTone; onPress?: () => void };

const useBannerStore = create<{ current: Banner | null; show: (b: Omit<Banner, 'id'>) => void; hide: () => void }>((set) => ({
  current: null,
  show: (b) => set({ current: { ...b, id: Date.now() } }),
  hide: () => set({ current: null }),
}));

/** Drop an in-app notification banner from the top of the screen. */
export const showBanner = (b: Omit<Banner, 'id'>) => useBannerStore.getState().show(b);

/**
 * In-app notification: springs down from under the status bar, stays long enough
 * to read (6 s), swipes up to dismiss, and is announced to VoiceOver.
 */
export function BannerHost() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const b = useBannerStore((s) => s.current);
  const hide = useBannerStore((s) => s.hide);
  const y = useSharedValue(-200);
  const icon = useSharedValue(0);

  useEffect(() => {
    if (!b) return;
    haptic.success();
    announce(`${b.title}. ${b.body ?? ''}`);
    y.value = t.reduceMotion ? withTiming(0, { duration: 150 }) : withSpring(0, springs.bouncy);
    icon.value = 0;
    icon.value = withDelay(250, withSpring(1, springs.bouncy));
    const timer = setTimeout(() => { y.value = withTiming(-200, { duration: 260 }, (f) => { if (f) runOnJS(hide)(); }); }, 6000);
    return () => clearTimeout(timer);
  }, [b, y, icon, hide, t.reduceMotion]);

  const pan = Gesture.Pan()
    .onUpdate((e) => { y.set(Math.min(0, e.translationY)); })
    .onEnd((e) => {
      if (e.translationY < -30) y.set(withTiming(-200, { duration: 200 }, (f) => { if (f) runOnJS(hide)(); }));
      else y.set(withSpring(0, springs.snappy));
    });

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.4 + icon.value * 0.6 }, { rotate: `${(1 - icon.value) * -30}deg` }] }));
  if (!b) return null;
  const tone = b.tone ?? 'navy';
  const bg = tone === 'navy' ? t.colors.blockNavy : tone === 'mint' ? t.colors.blockMint : t.colors.blockSand;
  const ink = tone === 'navy' ? '#FFFFFF' : tone === 'mint' ? '#013447' : t.colors.blockSandInk;
  const chip = tone === 'navy' ? t.colors.accent : '#013447';
  const chipInk = tone === 'navy' ? '#013447' : tone === 'mint' ? '#22D39C' : '#FCE9D2';
  return (
    <GestureDetector gesture={pan}>
      <Animated.View accessibilityLiveRegion="polite" style={[{ position: 'absolute', top: insets.top + 6, start: layout.margin, end: layout.margin, zIndex: 100 }, style]}>
        <Pressable onPress={() => { hide(); b.onPress?.(); }} accessibilityRole="button" accessibilityLabel={`${b.title}. ${b.body ?? ''}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm, paddingEnd: space.md, borderRadius: radii.hero, ...continuous, backgroundColor: bg, boxShadow: '0 16px 40px rgba(1,30,41,0.30)' }}>
          <Animated.View style={[{ width: 48, height: 48, borderRadius: 24, backgroundColor: chip, alignItems: 'center', justifyContent: 'center' }, iconStyle]}>
            <Icon name={b.icon} size={22} weight="semibold" color={{ raw: chipInk }} />
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text variant="headline" style={{ color: ink }} numberOfLines={1}>{b.title}</Text>
            {b.body ? <Text variant="subheadline" style={{ color: ink, opacity: 0.8 }} numberOfLines={2}>{b.body}</Text> : null}
          </View>
          <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: ink, opacity: 0.25, position: 'absolute', bottom: 6, alignSelf: 'center', start: '50%', marginStart: -18 }} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
