import { Image, type ImageSource } from 'expo-image';
import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useEffect } from 'react';

import { useT } from '@/i18n';
import { brand } from '@/theme/colors';
import { continuous, layout, space, useTheme } from '@/theme';
import { BannerBackdrop, BannerHeadline, go, Icon, Pressable, Text, useScreen, type IconName } from '@/ui';

/** The navy campaign night behind the first screens, full bleed. */
export function NavyStage({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={{ flex: 1, backgroundColor: '#01212E' }}>
      <BannerBackdrop tone="navy" width={width} height={height} />
      {children}
    </View>
  );
}

/** The wordmark in white for the navy screens. */
export function WordmarkOnDark({ size = 30 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, direction: 'ltr' }} accessibilityRole="header" accessibilityLabel="Movo">
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Circle cx={20} cy={20} r={20} fill={brand.mint} />
        <Path d="M10 27 L10 15 L20 23 L30 15 L30 27" stroke={brand.navy} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text weight="800" style={{ fontSize: size * 0.86, color: '#FFFFFF', letterSpacing: -0.5 }}>movo</Text>
    </View>
  );
}

/** Mint pill dots for the navy pager. */
export function MintDots({ count, index }: { count: number; index: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }} accessibilityRole="adjustable" accessibilityValue={{ min: 1, max: count, now: index + 1 }}>
      {Array.from({ length: count }, (_, i) => <MintDot key={i} on={i === index} />)}
    </View>
  );
}
function MintDot({ on }: { on: boolean }) {
  const w = useSharedValue(on ? 26 : 8);
  useEffect(() => { w.value = withTiming(on ? 26 : 8, { duration: 240 }); }, [on, w]);
  const s = useAnimatedStyle(() => ({ width: w.value }));
  return <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: on ? '#3CF2B8' : 'rgba(255,255,255,0.28)' }, s]} />;
}

/** A photo card with a small glass chip on it, used on the welcome slides. */
export function PhotoCard({ source, chip, chipIcon, height }: { source: ImageSource | number; chip: string; chipIcon: IconName; height: number }) {
  return (
    <View style={{ height, borderRadius: 30, ...continuous, overflow: 'hidden', backgroundColor: '#0A3F52', boxShadow: '0 24px 48px rgba(0,0,0,0.35)' }}>
      <Image source={source} style={{ flex: 1 }} contentFit="cover" transition={200} />
      <View style={{ position: 'absolute', start: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.92)' }}>
        <Icon name={chipIcon} size={14} color={{ raw: '#0B8F66' }} />
        <Text variant="footnote" weight="700" style={{ color: brand.navy }}>{chip}</Text>
      </View>
    </View>
  );
}

/** Header for the setup steps: a cream campaign band with back, step and a slanted headline. */
export function StepBanner({ step, total, top, bottom, sub, back = true }: { step: number; total: number; top: string; bottom: string; sub?: string; back?: boolean }) {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scr = useScreen();
  // Shorter band on SE-size screens so the choices and the button stay on screen.
  const h = insets.top + (scr.short ? 172 : 224);
  const band = (
    <View style={{ height: h, overflow: 'hidden', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, ...continuous }}>
      <BannerBackdrop tone="cream" width={width} height={h} />
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: scr.gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {back ? (
          <Pressable onPress={go.back} accessibilityRole="button" accessibilityLabel={tr('nav.back', 'Back')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(1,52,71,0.12)' }}>
            <Icon name="chevron.left" size={17} weight="semibold" color={{ raw: brand.navy }} mirrorInRTL />
          </Pressable>
        ) : <View />}
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }} accessibilityLabel={tr('onb.step', 'Step {{n}} of {{total}}', { n: step, total })}>
          {Array.from({ length: total }, (_, i) => <View key={i} style={{ width: i < step ? 22 : 10, height: 6, borderRadius: 3, backgroundColor: i < step ? '#1FCB8E' : 'rgba(11,42,56,0.15)' }} />)}
        </View>
      </View>
      <Animated.View entering={FadeInDown.springify().damping(24).stiffness(170)} style={{ paddingHorizontal: scr.gutter, marginTop: scr.short ? space.sm : space.lg }}>
        <BannerHeadline tone="cream" top={top} bottom={bottom} size={scr.short ? 31 : scr.fit(38)} />
      </Animated.View>
    </View>
  );
  return sub ? (
    <View>
      {band}
      <Text variant="body" color="textSecondary" style={{ paddingHorizontal: scr.gutter, marginTop: scr.short ? space.sm : space.md }}>{sub}</Text>
    </View>
  ) : band;
}

/** Bordered tile with a label, like a category tile. Selected: mint fill, mint border, check. */
export function PickTile({ icon, image, title, sub, selected, onPress, multi, index = 0, height = 128, compact, inline }: { icon?: IconName; image?: ImageSource | number; title: string; sub?: string; selected: boolean; onPress: () => void; multi?: boolean; index?: number; height?: number; compact?: boolean; inline?: boolean }) {
  const t = useTheme();
  const dark = t.scheme === 'dark';
  return (
    <Animated.View entering={FadeInDown.delay(80 + index * 50).springify().damping(24).stiffness(170)} style={{ flex: 1 }}>
      <Pressable onPress={onPress} accessibilityRole={multi ? 'checkbox' : 'radio'} accessibilityState={multi ? { checked: selected } : { selected }} accessibilityLabel={sub ? `${title}, ${sub}` : title}
        style={{ minHeight: image ? undefined : height, height: image ? height : undefined, borderRadius: 22, ...continuous, borderWidth: selected ? 2 : 1, borderColor: selected ? '#1FCB8E' : t.colors.separator, backgroundColor: selected ? (dark ? 'rgba(34,211,156,0.14)' : '#EAFBF4') : t.colors.bgElevated, overflow: 'hidden', padding: image ? 0 : compact || inline ? space.sm + 4 : space.md, flexDirection: inline ? 'row' : 'column', alignItems: inline ? 'center' : 'stretch', justifyContent: inline ? 'flex-start' : 'space-between', gap: inline ? space.sm : 0 }}>
        {image ? <Image source={image} style={{ flex: 1 }} contentFit="cover" transition={200} /> : null}
        {icon ? (
          <View style={{ width: compact || inline ? 36 : 46, height: compact || inline ? 36 : 46, borderRadius: 23, backgroundColor: selected ? '#1FCB8E' : dark ? 'rgba(255,255,255,0.08)' : '#F1F5F6', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={compact || inline ? 18 : 22} color={{ raw: selected ? '#FFFFFF' : dark ? '#E6EEF0' : brand.navy }} />
          </View>
        ) : null}
        {/* Fixed text block on photo tiles, so tiles side by side keep the same photo height. */}
        <View style={{ gap: 2, padding: image ? space.md : 0, paddingTop: image ? space.sm : inline ? 0 : compact ? 6 : space.sm, height: image ? 92 : undefined, flexShrink: 1, paddingEnd: inline ? 22 : undefined }}>
          <Text variant="headline" weight="700" numberOfLines={2} style={compact || inline ? { fontSize: 15, lineHeight: 19 } : undefined}>{title}</Text>
          {sub ? <Text variant="footnote" color="textSecondary" numberOfLines={image ? 1 : 2}>{sub}</Text> : null}
        </View>
        <View style={{ position: 'absolute', top: 10, end: 10, width: 24, height: 24, borderRadius: 12, borderWidth: selected ? 0 : 1.5, borderColor: image ? '#FFFFFF' : t.colors.separator, backgroundColor: selected ? '#1FCB8E' : image ? 'rgba(0,0,0,0.18)' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {selected ? <Icon name="checkmark" size={12} weight="bold" color={{ raw: '#FFFFFF' }} /> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
