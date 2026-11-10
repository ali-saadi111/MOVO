import { useId, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useT } from '@/i18n';
import { ltr } from '@/lib/rtl';
import { layout, space, useTheme } from '@/theme';
import { Icon } from './Icon';
import type { IconName } from './symbols';
import { Text } from './Text';

/** Small deterministic hash so the same booking always draws the same code. */
function seeded(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
}

/** A QR-looking code for the draft. The real app would encode the booking id. */
export function TicketQR({ value, size = 112, color = '#013447' }: { value: string; size?: number; color?: string }) {
  const n = 25;
  const c = size / n;
  const rnd = seeded(value);
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  const cells: ReactNode[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (finder(x, y)) continue;
    if (rnd() > 0.52) cells.push(<Rect key={`${x}-${y}`} x={x * c} y={y * c} width={c + 0.3} height={c + 0.3} fill={color} />);
  }
  const eye = (x: number, y: number) => [
    <Rect key={`e${x}${y}a`} x={x * c} y={y * c} width={7 * c} height={7 * c} rx={c * 1.6} fill={color} />,
    <Rect key={`e${x}${y}b`} x={(x + 1) * c} y={(y + 1) * c} width={5 * c} height={5 * c} rx={c * 1.1} fill="#FFFFFF" />,
    <Rect key={`e${x}${y}c`} x={(x + 2) * c} y={(y + 2) * c} width={3 * c} height={3 * c} rx={c * 0.8} fill={color} />,
  ];
  return (
    <Svg width={size} height={size} aria-hidden>
      <Rect width={size} height={size} fill="#FFFFFF" />
      {cells}
      {eye(0, 0)}{eye(n - 7, 0)}{eye(0, n - 7)}
    </Svg>
  );
}

/** A barcode strip for the order stub. */
export function TicketBarcode({ value, height = 56, width = 280, color = '#013447' }: { value: string; height?: number; width?: number; color?: string }) {
  const rnd = seeded(value);
  const bars: ReactNode[] = [];
  let x = 0;
  while (x < width) {
    const w = 1 + Math.floor(rnd() * 4);
    if (rnd() > 0.35) bars.push(<Rect key={x} x={x} y={0} width={w} height={height} fill={color} />);
    x += w + 1 + Math.floor(rnd() * 2);
  }
  return <Svg width={width} height={height} aria-hidden>{bars}</Svg>;
}

/** The torn edge between ticket parts: two half-circle notches and a dashed line. */
export function Perforation({ notch, dash }: { notch: string; dash?: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 24 }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: notch, marginStart: -12 }} />
      <View style={{ flex: 1, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: dash ?? t.colors.separator, marginHorizontal: 6 }} />
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: notch, marginEnd: -12 }} />
    </View>
  );
}

/** Label over a bold value, the ticket's basic cell. */
export function TicketField({ label, value, align = 'start', style }: { label: string; value: string; align?: 'start' | 'end'; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flex: 1, gap: 2, alignItems: align === 'end' ? 'flex-end' : 'flex-start' }, style]}>
      <Text variant="caption1" color="textSecondary">{label}</Text>
      <Text variant="headline" weight="700" numberOfLines={2} style={align === 'end' ? { textAlign: 'right' } : undefined}>{value}</Text>
    </View>
  );
}

/** Soft mint glow that sits behind confirmation screens. */
export function GlowBackdrop({ height = 520 }: { height?: number }) {
  const t = useTheme();
  const dark = t.scheme === 'dark';
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={`glow${uid}`} cx="50%" cy="28%" rx="75%" ry="55%">
            <Stop offset="0" stopColor="#22D39C" stopOpacity={dark ? 0.38 : 0.42} />
            <Stop offset="0.45" stopColor="#22D39C" stopOpacity={dark ? 0.14 : 0.16} />
            <Stop offset="1" stopColor="#22D39C" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#glow${uid})`} />
      </Svg>
    </View>
  );
}

/** Apple Wallet-style stacked cards mark. */
export function WalletGlyph() {
  const colors = ['#22D39C', '#F4B740', '#E5484D', '#3B82F6'];
  return (
    <View style={{ width: 26, height: 20, borderRadius: 4, backgroundColor: '#2B2B2B', overflow: 'hidden', paddingTop: 2, gap: 1 }}>
      {colors.map((c) => <View key={c} style={{ height: 3, marginHorizontal: 2, borderRadius: 1, backgroundColor: c }} />)}
    </View>
  );
}

type Row = [[string, string], [string, string]];

export function TicketCard({ image, head, rows, pass, barcode, footer }: {
  image?: ReactNode;
  head: ReactNode;
  rows: Row[];
  pass?: { code: string; label: string; lines: [string, IconName][] };
  barcode?: string;
  footer?: { icon: IconName; text: string };
}) {
  const t = useTheme();
  const tr = useT();
  const notch = t.colors.bgGrouped;
  const enter = (i: number) => (t.reduceMotion ? undefined : FadeInDown.delay(380 + i * 80).springify().damping(20).stiffness(170));
  return (
    <Animated.View entering={enter(0)} style={{ marginHorizontal: layout.margin, borderRadius: 28, backgroundColor: t.colors.bgElevated, overflow: 'hidden', boxShadow: '0 20px 44px rgba(1,52,71,0.14), 0 2px 6px rgba(1,52,71,0.06)' }}>
      {image ? <View style={{ padding: 10, paddingBottom: 0 }}>{image}</View> : null}
      <View style={{ padding: space.lg, paddingBottom: space.md, backgroundColor: image ? undefined : t.colors.bgSelected }}>{head}</View>
      <Perforation notch={notch} />
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.md, gap: space.md }}>
        {rows.map(([a, b], i) => (
          <Animated.View key={i} entering={enter(1 + i)} style={{ flexDirection: 'row', gap: space.md }}>
            <TicketField label={a[0]} value={a[1]} />
            <TicketField label={b[0]} value={b[1]} align="end" />
          </Animated.View>
        ))}
      </View>
      {pass ? (
        <Animated.View entering={enter(4)} style={{ marginHorizontal: space.md, marginBottom: space.md, borderRadius: 20, borderWidth: 1, borderColor: t.colors.separator, padding: space.sm, flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
          <View style={{ padding: 6, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: t.colors.separator }}>
            <TicketQR value={pass.code} size={96} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text variant="headline" weight="800" tabular>{ltr(pass.code)}</Text>
              <View style={{ paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: t.colors.blockMint, justifyContent: 'center' }}>
                <Text variant="caption2" weight="800" style={{ color: t.colors.blockMintInk }}>{tr('done.confirmed', 'CONFIRMED')}</Text>
              </View>
            </View>
            <Text variant="caption1" color="textSecondary">{pass.label}</Text>
            {pass.lines.filter(([s]) => s).map(([s, icon]) => (
              <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name={icon} size={13} color="textSecondary" />
                <Text variant="caption1" color="textSecondary">{s}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      ) : null}
      {barcode ? (
        <>
          <Perforation notch={notch} />
          <Animated.View entering={enter(4)} style={{ alignItems: 'center', paddingVertical: space.md, gap: 6 }}>
            <TicketBarcode value={barcode} width={260} height={52} color={t.colors.textPrimary} />
            <Text variant="caption1" color="textSecondary" tabular style={{ letterSpacing: 3 }}>{ltr(barcode)}</Text>
          </Animated.View>
        </>
      ) : null}
      {footer ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: space.lg, paddingVertical: space.sm, borderTopWidth: 1, borderColor: t.colors.separator }}>
          <Icon name={footer.icon} size={14} color="textSecondary" />
          <Text variant="caption1" color="textSecondary" style={{ flex: 1 }} numberOfLines={1}>{footer.text}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}
