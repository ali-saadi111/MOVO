import { Image, type ImageSource } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { continuous, layout, space, useTheme } from '@/theme';
import { BannerBackdrop, BannerHeadline, type BrandTone } from './brandBanner';
import { Pressable } from './Pressable';
import { Text } from './Text';

export type PromoSlide = { key: string; tone: BrandTone; top: string; bottom: string; caption?: string; image?: ImageSource | number; onPress?: () => void; label: string };

/**
 * The swipeable promo banners at the top of a tab, in the campaign style:
 * slanted headline on a navy or cream backdrop, an optional product photo on
 * the end side, dots underneath. Advances on its own until touched.
 */
export function PromoCarousel({ slides, height: h0, compact }: { slides: PromoSlide[]; height?: number; /** Short banner that peeks the next slide instead of showing dots. */ compact?: boolean }) {
  const height = h0 ?? (compact ? 112 : 172);
  const t = useTheme();
  const { width: win } = useWindowDimensions();
  const w = win - layout.margin * 2 - (compact && slides.length > 1 ? 28 : 0);
  const step = w + space.sm;
  const ref = useRef<ScrollViewInstance>(null);
  const [i, setI] = useState(0);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched || t.reduceMotion || slides.length < 2) return;
    const id = setTimeout(() => {
      const n = (i + 1) % slides.length;
      ref.current?.scrollTo({ x: n * step, animated: true });
      setI(n);
    }, 4500);
    return () => clearTimeout(id);
  }, [i, touched, t.reduceMotion, slides.length, step]);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setI(Math.round(e.nativeEvent.contentOffset.x / step));
  return (
    <Animated.View entering={FadeInDown.springify().damping(20).stiffness(170)} style={{ marginBottom: compact ? space.md : space.xl }}>
      <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} snapToInterval={step} decelerationRate="fast" disableIntervalMomentum
        onScrollBeginDrag={() => setTouched(true)} onMomentumScrollEnd={onEnd} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }}>
        {slides.map((s) => (
          <Pressable key={s.key} onPress={s.onPress} accessibilityRole="button" accessibilityLabel={s.label} feedback="scale"
            style={{ width: w, height, borderRadius: compact ? 20 : 24, ...continuous, overflow: 'hidden', justifyContent: 'center' }}>
            <BannerBackdrop tone={s.tone} width={w} height={height} />
            {s.image ? (
              <View style={{ position: 'absolute', ...(t.rtl ? { left: 14 } : { right: 14 }), top: compact ? 10 : 18, bottom: compact ? 10 : 18, width: w * (compact ? 0.3 : 0.38), borderRadius: compact ? 16 : 20, backgroundColor: '#FFFFFF', padding: 8, boxShadow: '0 10px 24px rgba(0,0,0,0.18)' }}>
                <Image source={s.image} style={{ flex: 1 }} contentFit="contain" />
              </View>
            ) : null}
            <BannerHeadline tone={s.tone} top={s.top} bottom={s.bottom} caption={s.caption} size={compact ? 22 : 30} style={{ paddingHorizontal: compact ? 16 : 20, width: s.image ? w * (compact ? 0.7 : 0.62) : w, alignSelf: 'flex-start' }} />
          </Pressable>
        ))}
      </ScrollView>
      {compact ? null : <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: space.sm }}>
        {slides.map((s, n) => <View key={s.key} style={{ width: n === i ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: n === i ? t.colors.textPrimary : t.colors.separator }} />)}
      </View>}
    </Animated.View>
  );
}

/** A row of round photos with labels under them, for browsing by type. */
export function RoundCategories({ items }: { items: { key: string; label: string; image?: ImageSource | number; onPress: () => void }[] }) {
  const t = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.md }} style={{ marginBottom: space.xl }}>
      {items.map((c, n) => (
        <Animated.View key={c.key} entering={FadeInDown.delay(60 + n * 40).springify().damping(20).stiffness(180)}>
          <Pressable onPress={c.onPress} accessibilityRole="button" accessibilityLabel={c.label} feedback="scale" style={{ alignItems: 'center', gap: 6, width: 72 }}>
            <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: t.scheme === 'dark' ? '#FFFFFF' : '#F3F6F7', borderWidth: 1, borderColor: t.colors.separator, overflow: 'hidden', padding: 9 }}>
              {c.image ? <Image source={c.image} style={{ flex: 1 }} contentFit="contain" /> : null}
            </View>
            <Text variant="caption1" weight="600" numberOfLines={1} align="center">{c.label}</Text>
          </Pressable>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
