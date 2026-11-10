import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { ZoomIn, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import type { ImageRef, Slot } from '@/data/models';
import { paymentLabel } from '@/features/labels';
import { useLang, useT } from '@/i18n';
import { addDays, fmtTime } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { continuous, layout, radii, space, springs, useTheme } from '@/theme';
import { ArtImage } from './Art';
import { PageIndicator } from './basics';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Section } from './lists';
import { Pressable } from './Pressable';
import { Text } from './Text';
import { edges } from '@/lib/rtl';

export type PayMethod = 'cash' | 'whish' | 'omt' | 'card';
const ORDER: PayMethod[] = ['cash', 'whish', 'omt', 'card'];
const PAY_LOGO: Record<PayMethod, number> = {
  cash: require('../../assets/pay/cash.png'),
  whish: require('../../assets/pay/whish.png'),
  omt: require('../../assets/pay/omt.png'),
  card: require('../../assets/pay/card.png'),
};

/** The payment brand's own mark (Whish, OMT, Visa/Mastercard) or a cash note, as a rounded tile. */
export function PayLogo({ method, size = 40 }: { method: PayMethod | string; size?: number }) {
  return <Image source={PAY_LOGO[method as PayMethod] ?? PAY_LOGO.cash} style={{ width: size, height: size, borderRadius: size * 0.29 }} contentFit="contain" accessibilityIgnoresInvertColors />;
}

/** Fixed order: Cash, Whish, OMT, Card. Cash is the default where allowed. */
export function PaymentMethodPicker({ value, onChange, allowCash = true, cashLabel }: { value: PayMethod; onChange: (m: PayMethod) => void; allowCash?: boolean; cashLabel?: string }) {
  const tr = useT();
  const methods = ORDER.filter((m) => allowCash || m !== 'cash');
  const sub: Record<PayMethod, string> = {
    cash: cashLabel ?? tr('pay.cashSub', 'Pay when it arrives'),
    whish: tr('pay.whishSub', 'Finish in the Whish app'),
    omt: tr('pay.omtSub', 'Pay at any OMT branch with a code'),
    card: tr('pay.cardSub', 'Visa or Mastercard'),
  };
  return (
    <Section header={tr('pay.header', 'Payment')}>
      {methods.map((m) => (
        <PayRow key={m} method={m} title={m === 'cash' && cashLabel ? tr('pay.cashAt', 'Cash') : paymentLabel(tr, m)} subtitle={sub[m]} selected={value === m} onPress={() => onChange(m)} />
      ))}
    </Section>
  );
}

function PayRow({ method, title, subtitle, selected, onPress }: { method: PayMethod; title: string; subtitle: string; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable feedback="highlight" onPress={() => { haptic.selection(); onPress(); }} accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={`${title}, ${subtitle}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: layout.rowWithSubtitle, paddingHorizontal: space.md, paddingVertical: space.xs }}>
        <PayLogo method={method} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="body">{title}</Text>
          <Text variant="footnote" color="textSecondary">{subtitle}</Text>
        </View>
        <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: selected ? 0 : 1.5, borderColor: t.colors.separator, backgroundColor: selected ? t.colors.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {selected ? <Animated.View entering={ZoomIn.springify().damping(15).stiffness(200)}><Icon name="checkmark" size={12} weight="bold" color={{ raw: '#013447' }} /></Animated.View> : null}
        </View>
      </View>
    </Pressable>
  );
}

/** 7-day strip, up to 30 days ahead. */
const DAY_W = 60;
const DAY_GAP = 8;

/**
 * Days as tall capsules. A navy pill slides to the chosen day on a spring, the
 * numbers swap colour under it, and a small dot marks days with free times.
 */
export function DayStrip({ value, onChange, days = 30 }: { value: string; onChange: (iso: string) => void; days?: number }) {
  const t = useTheme();
  const lang = useLang();
  const [today] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  const list = Array.from({ length: days }, (_, i) => addDays(today, i));
  const loc = lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB';
  const index = Math.max(0, list.findIndex((d) => new Date(value).toDateString() === d.toDateString()));
  const x = useSharedValue(index);
  const squish = useSharedValue(1);
  useEffect(() => {
    if (t.reduceMotion) { x.value = index; return; }
    x.value = withSpring(index, springs.snappy);
    squish.value = withSequence(withTiming(0.88, { duration: 90 }), withSpring(1, springs.bouncy));
  }, [index, x, squish, t.reduceMotion]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: (t.rtl ? -1 : 1) * x.value * (DAY_W + DAY_GAP) }, { scaleY: squish.value }] }));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: DAY_GAP, paddingVertical: 4 }}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 4, ...edges(t.rtl, { start: layout.margin }), width: DAY_W, height: 84, borderRadius: 30, backgroundColor: t.colors.buttonPrimaryBg, boxShadow: '0 8px 18px rgba(1,52,71,0.25)' }, pill]} />
      {list.map((d, i) => {
        const iso = d.toISOString();
        const sel = i === index;
        const weekend = d.getDay() === 0;
        return (
          <Pressable key={iso} feedback="scale" onPress={() => { haptic.selection(); onChange(iso); }} accessibilityRole="button" accessibilityState={{ selected: sel }} accessibilityLabel={new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long' }).format(d)}
            style={{ width: DAY_W, height: 84, borderRadius: 30, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: sel ? 'transparent' : t.colors.bgElevated }}>
            <Text variant="caption1" weight="700" style={{ color: sel ? t.colors.buttonPrimaryFg : t.colors.textSecondary, opacity: sel ? 0.8 : 1 }} maxFontSizeMultiplier={1.3}>{new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(d)}</Text>
            <Text tabular style={{ fontSize: 24, lineHeight: 28, fontWeight: '800', color: sel ? t.colors.buttonPrimaryFg : t.colors.textPrimary }} maxFontSizeMultiplier={1.3}>{d.getDate()}</Text>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: weekend ? 'transparent' : sel ? t.colors.accent : t.colors.fillStrong }} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SlotChip({ label, a11y, taken, sel, index, onPress }: { label: string; a11y: string; taken: boolean; sel: boolean; index: number; onPress: () => void }) {
  const t = useTheme();
  const pop = useSharedValue(1);
  useEffect(() => {
    if (sel && !t.reduceMotion) pop.value = withSequence(withTiming(1.12, { duration: 110 }), withSpring(1, springs.bouncy));
  }, [sel, pop, t.reduceMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <Animated.View entering={t.reduceMotion ? undefined : ZoomIn.delay(index * 35).springify().damping(14).stiffness(220)} style={[{ width: '31.5%' }, style]}>
      <Pressable disabled={taken} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: sel, disabled: taken }} accessibilityLabel={a11y}
        style={{ minHeight: 52, borderRadius: radii.capsule, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: sel ? t.colors.accent : taken ? 'transparent' : t.colors.bgElevated, borderWidth: taken ? 1.5 : 0, borderStyle: 'dashed', borderColor: t.colors.separator }}>
        {sel ? <Animated.View entering={t.reduceMotion ? undefined : ZoomIn.springify().damping(12)}><Icon name="checkmark" size={14} weight="bold" color={{ raw: '#013447' }} /></Animated.View> : null}
        <Text variant="callout" tabular weight={sel ? '800' : '600'} style={{ color: sel ? '#013447' : taken ? t.colors.textTertiary : t.colors.textPrimary, textDecorationLine: taken ? 'line-through' : 'none' }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Times pop in one after another when the day changes; the chosen one bounces and turns mint. */
export function TimeSlotGrid({ slots, value, onChange }: { slots: Slot[]; value: string | null; onChange: (iso: string) => void }) {
  const tr = useT();
  const lang = useLang();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, paddingHorizontal: layout.margin }}>
      {slots.map((s, i) => {
        const label = fmtTime(s.startsAt, lang);
        return <SlotChip key={s.startsAt} index={i} label={label} a11y={s.taken ? tr('slot.taken', '{{t}}, taken', { t: label }) : label} taken={s.taken} sel={value === s.startsAt} onPress={() => { haptic.selection(); onChange(s.startsAt); }} />;
      })}
    </View>
  );
}

export function OrderTimeline({ steps }: { steps: { title: string; at?: string; done: boolean; current?: boolean; extra?: React.ReactNode }[] }) {
  const t = useTheme();
  return (
    <View style={{ paddingHorizontal: layout.margin }}>
      {steps.map((s, i) => (
        <View key={s.title} style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ alignItems: 'center', width: 24 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: s.done ? t.colors.accent : t.colors.fill, alignItems: 'center', justifyContent: 'center', borderWidth: s.current ? 2 : 0, borderColor: t.colors.accent }}>
              {s.done ? <Icon name="checkmark" size={12} weight="bold" color={{ raw: '#013447' }} /> : null}
            </View>
            {i < steps.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 28, backgroundColor: steps[i + 1].done ? t.colors.accent : t.colors.fill, marginVertical: 2 }} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: space.lg, gap: 2 }}>
            <Text variant="headline" color={s.done || s.current ? 'textPrimary' : 'textSecondary'}>{s.title}</Text>
            {s.at ? <Text variant="footnote" color="textSecondary" tabular>{s.at}</Text> : null}
            {s.extra}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Full-width 1:1 pager with dots, a visible "1 of 4" and previous/next buttons. */
export function ImagePager({ images, onOpen }: { images: ImageRef[]; onOpen?: (i: number) => void }) {
  const { width } = useWindowDimensions();
  const tr = useT();
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList<ImageRef>>(null);
  const viewable = useCallback(({ viewableItems }: { viewableItems: { index?: number | null }[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }, []);
  const go = (i: number) => { const n = Math.max(0, Math.min(images.length - 1, i)); list.current?.scrollToIndex({ index: n, animated: true }); setIndex(n); };
  return (
    <View>
      <FlatList
        ref={list}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={viewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index: i }) => (
          <Pressable feedback="none" onPress={() => onOpen?.(i)} style={{ width }} accessibilityRole="imagebutton" accessibilityLabel={tr('pager.open', 'Open photo {{n}} of {{total}}', { n: i + 1, total: images.length })}>
            <ArtImage image={item} aspect={1} tile radius={0} edge={false} />
          </Pressable>
        )}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xs, marginTop: space.xs }}>
        <IconButton icon="chevron.left" label={tr('pager.prev', 'Previous photo')} onPress={() => go(index - 1)} mirrorInRTL style={{ opacity: index === 0 ? 0.3 : 1 }} />
        <View style={{ alignItems: 'center', gap: 6 }}>
          <PageIndicator count={images.length} index={index} />
          <Text variant="caption1" color="textSecondary" tabular>{tr('pager.of', '{{n}} of {{total}}', { n: index + 1, total: images.length })}</Text>
        </View>
        <IconButton icon="chevron.right" label={tr('pager.next', 'Next photo')} onPress={() => go(index + 1)} mirrorInRTL style={{ opacity: index === images.length - 1 ? 0.3 : 1 }} />
      </View>
    </View>
  );
}
