import { Image, type ImageSource } from 'expo-image';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useT } from '@/i18n';
import { brand } from '@/theme/colors';
import { continuous, space, useTheme } from '@/theme';
import { go, Icon, Pressable, Text, useScreen, type IconName } from '@/ui';

/**
 * The "conversation" starting pages: Movo asks one question at a time in bubbles,
 * the person answers with big buttons, and their answers stay on screen as their own bubbles.
 */

const MINT = '#1FCB8E';
const enter = (delay: number) => FadeInDown.delay(delay).springify().damping(24).stiffness(170);

/** Movo's round avatar: the wordmark's M on mint. */
export function MovoAvatar({ size = 30 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#3CF2B8', alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden importantForAccessibility="no">
      <Svg width={size * 0.64} height={size * 0.64} viewBox="0 0 40 40">
        <Path d="M10 27 L10 15 L20 23 L30 15 L30 27" stroke={brand.navy} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

/** One bubble. `from="movo"` sits on the start side, `from="me"` on the end side. */
export function Bubble({ from, children, delay = 0, onDark, faded, lang }: { from: 'movo' | 'me'; children: ReactNode; delay?: number; onDark?: boolean; faded?: boolean; lang?: 'ar' }) {
  const t = useTheme();
  const dark = t.scheme === 'dark';
  const movo = from === 'movo';
  const bg = movo ? (onDark ? '#FFFFFF' : dark ? 'rgba(255,255,255,0.09)' : '#F1F5F6') : dark ? '#3CF2B8' : brand.navy;
  const fg = movo ? (onDark || !dark ? brand.navy : '#E6EEF0') : dark ? brand.navy : '#FFFFFF';
  return (
    <Animated.View entering={enter(delay)} style={{ alignSelf: movo ? 'flex-start' : 'flex-end', maxWidth: '84%' }}>
      <View style={{ opacity: faded ? 0.55 : 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, ...continuous, backgroundColor: bg, borderBottomStartRadius: movo ? 6 : 20, borderBottomEndRadius: movo ? 20 : 6 }}>
        {typeof children === 'string' ? (
          <Text variant="subheadline" weight={movo ? '500' : '700'} style={{ color: fg, writingDirection: lang === 'ar' ? 'rtl' : undefined }}>{children}</Text>
        ) : children}
      </View>
    </Animated.View>
  );
}

/** A run of Movo's bubbles with the avatar beside the last one. Each line arrives a beat after the one before. */
export function MovoSays({ lines, delay = 0, step = 260, onDark, style }: { lines: (string | { text: string; lang?: 'ar' })[]; delay?: number; step?: number; onDark?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', gap: space.xs }, style]}>
      <Animated.View entering={FadeIn.delay(delay)}><MovoAvatar size={28} /></Animated.View>
      <View style={{ flex: 1, gap: 6 }} accessible accessibilityLabel={lines.map((l) => (typeof l === 'string' ? l : l.text)).join(' ')}>
        {lines.map((l, i) => {
          const text = typeof l === 'string' ? l : l.text;
          const lang = typeof l === 'string' ? undefined : l.lang;
          return <Bubble key={i} from="movo" delay={delay + i * step} onDark={onDark} lang={lang}>{text}</Bubble>;
        })}
      </View>
    </View>
  );
}

/** A small card inside the chat, showing one real thing Movo does. */
export function ChatCard({ image, title, line, icon, delay = 0 }: { image: ImageSource | number; title: string; line: string; icon: IconName; delay?: number }) {
  const t = useTheme();
  const dark = t.scheme === 'dark';
  return (
    <Animated.View entering={enter(delay)} style={{ alignSelf: 'flex-start', maxWidth: '88%', marginStart: 36 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: 8, paddingEnd: space.md, borderRadius: 20, ...continuous, backgroundColor: dark ? 'rgba(255,255,255,0.09)' : '#F1F5F6' }} accessible accessibilityLabel={`${title}. ${line}`}>
        <Image source={image} style={{ width: 56, height: 56, borderRadius: 14 }} contentFit="cover" transition={200} />
        <View style={{ flexShrink: 1, gap: 2 }}>
          <Text variant="subheadline" weight="700" numberOfLines={1}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
            <Icon name={icon} size={13} style={{ marginTop: 2 }} color={{ raw: dark ? '#3CF2B8' : '#0B8F66' }} />
            <Text variant="footnote" weight="600" numberOfLines={2} style={{ color: dark ? '#3CF2B8' : '#0B8F66', flexShrink: 1 }}>{line}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

/** A big answer chip. Selected chips fill mint. */
export function AnswerChip({ icon, label, selected, onPress, multi, index = 0 }: { icon: IconName; label: string; selected: boolean; onPress: () => void; multi?: boolean; index?: number }) {
  const t = useTheme();
  const dark = t.scheme === 'dark';
  return (
    <Animated.View entering={enter(80 + index * 50)}>
      <Pressable onPress={onPress} accessibilityRole={multi ? 'checkbox' : 'radio'} accessibilityState={multi ? { checked: selected } : { selected }} accessibilityLabel={label}
        style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingStart: 8, paddingEnd: space.md, borderRadius: 24, borderWidth: 1.5, borderColor: selected ? MINT : t.colors.separator, backgroundColor: selected ? MINT : dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF' }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? 'rgba(255,255,255,0.22)' : dark ? 'rgba(255,255,255,0.08)' : '#F1F5F6' }}>
          <Icon name={selected ? 'checkmark' : icon} size={16} weight={selected ? 'bold' : 'regular'} color={{ raw: selected ? '#FFFFFF' : dark ? '#E6EEF0' : brand.navy }} />
        </View>
        <Text variant="subheadline" weight="700" style={{ color: selected ? '#FFFFFF' : t.colors.textPrimary }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** A larger answer with a photo, for "who is Movo for". */
export function AnswerCard({ image, title, sub, selected, onPress, index = 0 }: { image: ImageSource | number; title: string; sub: string; selected: boolean; onPress: () => void; index?: number }) {
  const t = useTheme();
  const dark = t.scheme === 'dark';
  return (
    <Animated.View entering={enter(80 + index * 60)}>
      <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={`${title}, ${sub}`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: 8, paddingEnd: space.md, borderRadius: 24, ...continuous, borderWidth: selected ? 2 : 1, borderColor: selected ? MINT : t.colors.separator, backgroundColor: selected ? (dark ? 'rgba(34,211,156,0.14)' : '#EAFBF4') : t.colors.bgElevated }}>
        <Image source={image} style={{ width: 64, height: 64, borderRadius: 18 }} contentFit="cover" contentPosition="top" transition={200} />
        <View style={{ flex: 1 }}>
          <Text variant="headline" weight="700" numberOfLines={2}>{title}</Text>
          <Text variant="footnote" color="textSecondary" numberOfLines={2}>{sub}</Text>
        </View>
        <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: selected ? 0 : 2, borderColor: t.colors.separator, backgroundColor: selected ? MINT : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {selected ? <Icon name="checkmark" size={12} weight="bold" color={{ raw: '#FFFFFF' }} /> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Back button and the thin progress bar, with no headline: the question is in the chat. */
export function ChatTop({ step, total, back = true }: { step: number; total: number; back?: boolean }) {
  const tr = useT();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const scr = useScreen();
  return (
    <View style={{ paddingTop: insets.top + 6, paddingHorizontal: scr.gutter, flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44 }}>
      {back ? (
        <Pressable onPress={go.back} accessibilityRole="button" accessibilityLabel={tr('nav.back', 'Back')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F6', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevron.left" size={17} weight="semibold" color="textPrimary" mirrorInRTL />
        </Pressable>
      ) : null}
      <View style={{ flex: 1, flexDirection: 'row', gap: 6 }} accessibilityLabel={tr('onb.step', 'Step {{n}} of {{total}}', { n: step, total })}>
        {Array.from({ length: total }, (_, i) => <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i < step ? MINT : t.colors.separator }} />)}
      </View>
    </View>
  );
}
