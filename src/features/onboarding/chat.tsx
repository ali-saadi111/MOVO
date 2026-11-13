import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollView, View, type ScrollViewInstance, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useT } from '@/i18n';
import { brand } from '@/theme/colors';
import { continuous, space, useTheme } from '@/theme';
import { go, Icon, Pressable, Text, useScreen, type IconName } from '@/ui';

/**
 * The starting pages as a real phone chat with Movo: a chat header with Movo's name,
 * the conversation filling up from the bottom, and the person's answers in a reply tray
 * docked at the bottom, like quick replies above a keyboard. No photos, only icons.
 */

const MINT = '#3CF2B8';
const MINT_DEEP = '#1FCB8E';
const enter = (delay: number) => FadeInDown.delay(delay).springify().damping(24).stiffness(190);

/** Colors that only the chat uses, picked per theme. */
export function useChatColors() {
  const t = useTheme();
  const dark = t.scheme === 'dark';
  return {
    dark,
    screen: t.colors.bgPrimary,
    movoBg: dark ? '#1C1C1E' : '#EEF2F3',
    movoFg: dark ? '#F2F5F6' : brand.navy,
    meBg: dark ? MINT : brand.navy,
    meFg: dark ? brand.navy : '#FFFFFF',
    tray: dark ? '#111113' : '#F7F9FA',
    trayLine: dark ? 'rgba(255,255,255,0.08)' : 'rgba(1,52,71,0.08)',
    option: dark ? '#1C1C1E' : '#FFFFFF',
    optionLine: dark ? 'rgba(255,255,255,0.10)' : 'rgba(1,52,71,0.12)',
    tile: dark ? 'rgba(60,242,184,0.14)' : '#E3F8F0',
    tileFg: dark ? MINT : '#0B8F66',
    accent: dark ? MINT : '#0B8F66',
    muted: t.colors.textSecondary,
  };
}

/** Movo's round avatar: the wordmark's M on mint, with an optional "online" dot. */
export function MovoAvatar({ size = 30, online }: { size?: number; online?: boolean }) {
  const c = useChatColors();
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no">
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: MINT, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40">
          <Path d="M10 27 L10 15 L20 23 L30 15 L30 27" stroke={brand.navy} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
      {online ? <View style={{ position: 'absolute', end: -1, bottom: -1, width: size * 0.3, height: size * 0.3, borderRadius: size, backgroundColor: MINT_DEEP, borderWidth: 2, borderColor: c.screen }} /> : null}
    </View>
  );
}

/**
 * The chat header: back, Movo's avatar and name, and what step this is. A thin progress line
 * runs along the bottom edge, like a page loading.
 */
export function ChatHeader({ step, total, back = true, right }: { step?: number; total?: number; back?: boolean; right?: ReactNode }) {
  const tr = useT();
  const t = useTheme();
  const c = useChatColors();
  const insets = useSafeAreaInsets();
  const scr = useScreen();
  const hasStep = !!step && !!total;
  const fill = useSharedValue(hasStep ? (step - 1) / total : 0);
  useEffect(() => { if (hasStep) fill.value = withTiming(step / total, { duration: t.reduceMotion ? 0 : 500 }); }, [hasStep, step, total, fill, t.reduceMotion]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  return (
    <View style={{ paddingTop: insets.top + 4, backgroundColor: c.screen }}>
      <View style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingStart: back ? space.xxs : scr.gutter, paddingEnd: space.xxs }}>
        {back ? (
          <Pressable onPress={go.back} accessibilityRole="button" accessibilityLabel={tr('nav.back', 'Back')} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron.left" size={20} weight="semibold" color={{ raw: c.accent }} mirrorInRTL />
          </Pressable>
        ) : null}
        <MovoAvatar size={38} online />
        <View style={{ flex: 1, marginStart: 4 }}>
          <Text variant="headline" weight="700">Movo</Text>
          <Text variant="caption1" style={{ color: c.muted }} accessibilityLabel={hasStep ? tr('onb.step', 'Step {{n}} of {{total}}', { n: step, total }) : undefined}>
            {hasStep ? tr('onb.chat.stepOf', 'Step {{n}} of {{total}} · about a minute', { n: step, total }) : tr('onb.chat.online', 'Your accessibility guide')}
          </Text>
        </View>
        {right}
      </View>
      <View style={{ height: 2, backgroundColor: c.trayLine }} accessibilityRole={hasStep ? 'progressbar' : undefined} accessibilityValue={hasStep ? { min: 0, max: total, now: step } : undefined}>
        {hasStep ? <Animated.View style={[{ height: 2, backgroundColor: MINT_DEEP, borderRadius: 1 }, fillStyle]} /> : null}
      </View>
    </View>
  );
}

/** The scrolling conversation. It sits at the bottom and grows upward, like a real chat. */
export function ChatBody({ children }: { children: ReactNode }) {
  const scr = useScreen();
  const tr = useT();
  const c = useChatColors();
  const ref = useRef<ScrollViewInstance>(null);
  // New messages arrive at the bottom, so keep the latest one in view.
  return (
    <ScrollView ref={ref} onContentSizeChange={() => ref.current?.scrollToEnd({ animated: true })} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: scr.gutter, paddingTop: space.lg, paddingBottom: space.md, gap: space.md }} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeIn.duration(400)} style={{ alignSelf: 'center', marginBottom: space.xxs }}>
        <Text variant="caption1" weight="600" style={{ color: c.muted }}>{tr('onb.chat.today', 'Today')}</Text>
      </Animated.View>
      {children}
    </ScrollView>
  );
}

type Pos = 'single' | 'first' | 'middle' | 'last';
/** Corner shape for grouped bubbles: the corners where bubbles meet are tight, like Messages. */
function corners(pos: Pos, movo: boolean) {
  const big = 20;
  const tight = 6;
  const topTight = pos === 'middle' || pos === 'last';
  const bottomTight = pos === 'first' || pos === 'middle';
  return movo
    ? { borderTopStartRadius: topTight ? tight : big, borderBottomStartRadius: bottomTight ? tight : big, borderTopEndRadius: big, borderBottomEndRadius: big }
    : { borderTopEndRadius: topTight ? tight : big, borderBottomEndRadius: bottomTight ? tight : big, borderTopStartRadius: big, borderBottomStartRadius: big };
}

/** One bubble. Movo's sit on the start side, the person's on the end side. */
export function Bubble({ from, children, delay = 0, pos = 'single', lang, style }: { from: 'movo' | 'me'; children: ReactNode; delay?: number; pos?: Pos; lang?: 'ar'; style?: StyleProp<ViewStyle> }) {
  const c = useChatColors();
  const movo = from === 'movo';
  return (
    <Animated.View entering={enter(delay)} style={[{ alignSelf: movo ? 'flex-start' : 'flex-end', maxWidth: '82%' }, style]}>
      <View style={{ paddingHorizontal: 14, paddingVertical: 9, ...continuous, ...corners(pos, movo), backgroundColor: movo ? c.movoBg : c.meBg }}>
        {typeof children === 'string' ? (
          <Text variant="callout" weight={movo ? '400' : '600'} style={{ color: movo ? c.movoFg : c.meFg, writingDirection: lang === 'ar' ? 'rtl' : undefined }}>{children}</Text>
        ) : children}
      </View>
    </Animated.View>
  );
}

/** Three dots that pulse while Movo is "typing". */
function Typing() {
  const c = useChatColors();
  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)} style={{ alignSelf: 'flex-start', flexDirection: 'row', gap: 4, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 20, ...continuous, borderBottomStartRadius: 6, backgroundColor: c.movoBg }}>
      {[0, 1, 2].map((i) => <Dot key={i} i={i} color={c.muted} />)}
    </Animated.View>
  );
}
function Dot({ i, color }: { i: number; color: string }) {
  const o = useSharedValue(0.35);
  useEffect(() => { o.value = withDelay(i * 140, withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0.35, { duration: 300 })), -1)); }, [i, o]);
  const s = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }, s]} />;
}

/** Shows Movo typing for a moment, then the content. Skipped with Reduce Motion. */
function useTyped(delay: number) {
  const t = useTheme();
  const wait = t.reduceMotion ? 0 : delay;
  const [shown, setShown] = useState(wait === 0);
  useEffect(() => {
    if (wait === 0) return;
    const id = setTimeout(() => setShown(true), wait);
    return () => clearTimeout(id);
  }, [wait]);
  return shown;
}

/**
 * A group of Movo's messages: Movo types for a moment, then the lines arrive one by one.
 * The avatar sits beside the last line. `extra` goes in the group, after the lines (a card).
 */
export function MovoSays({ lines, delay = 0, typing = 650, step = 220, extra, after, style }: {
  lines: (string | { text: string; lang?: 'ar' })[]; delay?: number; typing?: number; step?: number; extra?: ReactNode; after?: (string | { text: string; lang?: 'ar' })[]; style?: StyleProp<ViewStyle>;
}) {
  const started = useTyped(delay);
  const shown = useTyped(delay + typing);
  const all = [...lines, ...(extra ? ['__extra__'] : []), ...(after ?? [])];
  const label = all.filter((l) => l !== '__extra__').map((l) => (typeof l === 'string' ? l : l.text)).join(' ');
  if (!started) return null;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', gap: space.xs }, style]}>
      <MovoAvatar size={28} />
      <View style={{ flex: 1, gap: 3 }} accessible={!extra} accessibilityLabel={extra ? undefined : label}>
        {!shown ? <Typing /> : all.map((l, i) => {
          const pos: Pos = all.length === 1 ? 'single' : i === 0 ? 'first' : i === all.length - 1 ? 'last' : 'middle';
          if (l === '__extra__') return <Animated.View key={i} entering={enter(i * step)}>{extra}</Animated.View>;
          const text = typeof l === 'string' ? l : l.text;
          const lang = typeof l === 'string' ? undefined : l.lang;
          return <Bubble key={i} from="movo" pos={pos} delay={i * step} lang={lang}>{text}</Bubble>;
        })}
      </View>
    </View>
  );
}

/** The person's own messages, on the end side, with a small "Sent" under the last one. */
export function MeSays({ lines, delay = 0, style }: { lines: string[]; delay?: number; style?: StyleProp<ViewStyle> }) {
  const c = useChatColors();
  const tr = useT();
  return (
    <View style={[{ gap: 3, alignItems: 'flex-end' }, style]}>
      {lines.map((l, i) => (
        <Bubble key={l} from="me" delay={delay + i * 60} pos={lines.length === 1 ? 'single' : i === 0 ? 'first' : i === lines.length - 1 ? 'last' : 'middle'}>{l}</Bubble>
      ))}
      <Animated.View entering={FadeIn.delay(delay + 200)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginEnd: 4 }}>
        <Icon name="checkmark" size={11} weight="bold" color={{ raw: c.accent }} />
        <Text variant="caption2" weight="600" style={{ color: c.muted }}>{tr('onb.chat.sent', 'Sent')}</Text>
      </Animated.View>
    </View>
  );
}

/** A list inside one of Movo's bubbles: an icon tile, a title and one line, per row. */
export function FeatureList({ items }: { items: { icon: IconName; title: string; line: string }[] }) {
  const c = useChatColors();
  return (
    <View style={{ alignSelf: 'flex-start', width: '92%', borderRadius: 20, ...continuous, borderTopStartRadius: 6, borderBottomStartRadius: 6, backgroundColor: c.movoBg, paddingHorizontal: 14, paddingVertical: 4 }}>
      {items.map((it, i) => (
        <View key={it.title} accessible accessibilityLabel={`${it.title}. ${it.line}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: c.trayLine }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, ...continuous, backgroundColor: c.tile, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={it.icon} size={21} color={{ raw: c.tileFg }} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text variant="subheadline" weight="700" style={{ color: c.movoFg }}>{it.title}</Text>
            <Text variant="footnote" style={{ color: c.muted }}>{it.line}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * The reply tray docked at the bottom of the screen: a small label, the answers, then the main button.
 * It slides up after Movo has asked, like a keyboard of quick replies.
 */
export function ReplyTray({ label, children, footer, delay = 0 }: { label?: string; children?: ReactNode; footer: ReactNode; delay?: number }) {
  const c = useChatColors();
  const insets = useSafeAreaInsets();
  const scr = useScreen();
  const t = useTheme();
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(delay).springify().damping(26).stiffness(180)}
      style={{ backgroundColor: c.tray, borderTopWidth: 1, borderTopColor: c.trayLine, borderTopStartRadius: 28, borderTopEndRadius: 28, ...continuous, paddingTop: space.sm, paddingHorizontal: scr.gutter, paddingBottom: Math.max(insets.bottom, space.md), gap: space.sm }}>
      <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: c.optionLine }} />
      {label ? <Text variant="caption1" weight="700" style={{ color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Text> : null}
      {children}
      {footer}
    </Animated.View>
  );
}

/** A full-width answer row in the tray: icon tile, title, a short line, and a radio. */
export function ReplyRow({ icon, title, sub, selected, onPress }: { icon: IconName; title: string; sub?: string; selected: boolean; onPress: () => void }) {
  const c = useChatColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={sub ? `${title}, ${sub}` : title}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 64, paddingHorizontal: space.sm, borderRadius: 18, ...continuous, borderWidth: 1.5, borderColor: selected ? MINT_DEEP : c.optionLine, backgroundColor: selected ? c.tile : c.option }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: selected ? MINT : c.tile, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color={{ raw: selected ? brand.navy : c.tileFg }} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="headline" weight="700">{title}</Text>
        {sub ? <Text variant="footnote" style={{ color: c.muted }}>{sub}</Text> : null}
      </View>
      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: selected ? 0 : 2, borderColor: c.optionLine, backgroundColor: selected ? MINT_DEEP : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {selected ? <Icon name="checkmark" size={13} weight="bold" color={{ raw: '#FFFFFF' }} /> : null}
      </View>
    </Pressable>
  );
}

/** A quick-reply chip in the tray. Selected chips fill mint. */
export function ReplyChip({ icon, label, selected, onPress, multi, grid }: { icon?: IconName; label: string; selected: boolean; onPress: () => void; multi?: boolean; grid?: boolean }) {
  const c = useChatColors();
  return (
    <Pressable onPress={onPress} accessibilityRole={multi ? 'checkbox' : 'radio'} accessibilityState={multi ? { checked: selected } : { selected }} accessibilityLabel={label}
      style={{ ...(grid ? { flexGrow: 1, flexBasis: '45%' } : null), minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 6, paddingStart: icon ? 10 : space.md, paddingEnd: space.md, borderRadius: 22, borderWidth: 1.5, borderColor: selected ? MINT_DEEP : c.optionLine, backgroundColor: selected ? MINT : c.option }}>
      {icon ? <Icon name={selected ? 'checkmark' : icon} size={17} weight={selected ? 'bold' : 'regular'} color={{ raw: selected ? brand.navy : c.tileFg }} /> : null}
      <Text variant="subheadline" weight="700" numberOfLines={2} style={{ flexShrink: 1, color: selected ? brand.navy : undefined }}>{label}</Text>
    </Pressable>
  );
}

/** Chips that wrap, in the tray. */
export function ReplyChips({ children, role = 'list' }: { children: ReactNode; role?: 'list' | 'radiogroup' }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }} accessibilityRole={role}>{children}</View>;
}
