import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { Icon } from './Icon';
import { Pressable } from './Pressable';
import type { IconName } from './symbols';
import { Text } from './Text';

/** Inset grouped section, iOS standard insets, with header and footer text. */
export function Section({ header, footer, children, style, bare }: { header?: string; footer?: string; children: ReactNode; style?: StyleProp<ViewStyle>; bare?: boolean }) {
  const t = useTheme();
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={[{ marginHorizontal: layout.margin, marginBottom: space.xl }, style]}>
      {header ? <Text variant="footnote" color="textSecondary" accessibilityRole="header" style={{ marginStart: space.md, marginBottom: 6, textTransform: t.rtl ? 'none' : 'uppercase' }}>{header}</Text> : null}
      <View style={bare ? null : { backgroundColor: t.colors.bgElevated, borderRadius: radii.cell + 2, ...continuous, overflow: 'hidden', borderWidth: t.scheme === 'dark' || t.highContrast ? 0 : 0 }}>
        {items.map((child, i) => (
          <Fragment key={isValidElement(child) && child.key != null ? child.key : i}>
            {child}
            {i < items.length - 1 && !bare ? <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.separator, marginStart: (isValidElement(child) && (child.props as { icon?: unknown }).icon ? 58 : space.md) }} /> : null}
          </Fragment>
        ))}
      </View>
      {footer ? <Text variant="footnote" color="textSecondary" style={{ marginHorizontal: space.md, marginTop: 6 }}>{footer}</Text> : null}
    </View>
  );
}

export function IconTile({ icon, tone = 'fill' }: { icon: IconName; tone?: 'fill' | 'brand' | 'danger' }) {
  const t = useTheme();
  return (
    <View style={{ width: layout.tileIcon, height: layout.tileIcon, borderRadius: radii.iconTile, ...continuous, backgroundColor: tone === 'brand' ? t.colors.bgSelected : t.colors.fill, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={17} color={tone === 'danger' ? 'danger' : 'tint'} rendering="hierarchical" />
    </View>
  );
}

type Trailing = { type: 'chevron' } | { type: 'value'; text: string } | { type: 'check'; on: boolean } | { type: 'node'; node: ReactNode } | { type: 'none' };

export function ListRow({ icon, title, subtitle, trailing = { type: 'chevron' }, onPress, destructive, leading, accessibilityLabel, selected, subtitleLines }: {
  icon?: IconName; title: string; subtitle?: string; trailing?: Trailing; onPress?: () => void; destructive?: boolean; leading?: ReactNode; accessibilityLabel?: string; selected?: boolean; subtitleLines?: number;
}) {
  const t = useTheme();
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: subtitle ? layout.rowWithSubtitle : layout.rowMin + 4, paddingHorizontal: space.md, paddingVertical: space.xs + 2, gap: space.sm, backgroundColor: selected ? t.colors.bgSelected : undefined }}>
      {leading ?? (icon ? <IconTile icon={icon} tone={destructive ? 'danger' : 'fill'} /> : null)}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" color={destructive ? 'danger' : 'textPrimary'}>{title}</Text>
        {subtitle ? <Text variant="subheadline" color="textSecondary" numberOfLines={subtitleLines}>{subtitle}</Text> : null}
      </View>
      {trailing.type === 'chevron' && onPress ? <Icon name="chevron.right" size={14} weight="semibold" color="textTertiary" mirrorInRTL /> : null}
      {trailing.type === 'value' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '45%' }}>
          <Text variant="body" color="textSecondary" numberOfLines={1} tabular>{trailing.text}</Text>
          {onPress ? <Icon name="chevron.right" size={14} weight="semibold" color="textTertiary" mirrorInRTL /> : null}
        </View>
      ) : null}
      {trailing.type === 'check' && trailing.on ? (
        <Animated.View entering={ZoomIn.springify().damping(15).stiffness(200)}>
          <Icon name="checkmark" size={18} weight="bold" color={t.scheme === 'dark' ? 'accent' : 'tint'} />
        </Animated.View>
      ) : null}
      {trailing.type === 'node' && !onPress ? trailing.node : null}
    </View>
  );
  if (!onPress) return <View accessible accessibilityLabel={accessibilityLabel}>{body}</View>;
  const row = (
    <Pressable
      feedback="highlight"
      onPress={() => {
        if (trailing.type === 'check') haptic.selection();
        onPress();
      }}
      accessibilityRole={trailing.type === 'check' ? 'radio' : 'button'}
      accessibilityState={trailing.type === 'check' ? { checked: trailing.on } : undefined}
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}, ${subtitle}` : title)}
    >
      {body}
    </Pressable>
  );
  // A tappable row with its own control (a Switch button): keep the control outside the row's button, so buttons never nest.
  if (trailing.type === 'node') return <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: selected ? t.colors.bgSelected : undefined }}><View style={{ flex: 1 }}>{row}</View><View style={{ paddingEnd: space.md }}>{trailing.node}</View></View>;
  return row;
}

/** Onboarding choice row: 64 pt with a trailing ✓. */
export function ChoiceRow({ title, subtitle, selected, onPress, icon, multi }: { title: string; subtitle?: string; selected: boolean; onPress: () => void; icon?: IconName; multi?: boolean }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => { haptic.selection(); onPress(); }}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      style={{ minHeight: 64, borderRadius: radii.card, ...continuous, paddingHorizontal: space.md, paddingVertical: space.sm, flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: selected ? t.colors.bgSelected : t.colors.bgElevated, borderWidth: selected ? 2 : t.highContrast ? 1.5 : StyleSheet.hairlineWidth, borderColor: selected ? t.colors.accent : t.colors.separator }}
    >
      {icon ? <Icon name={icon} size={24} color="tint" rendering="hierarchical" /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="headline">{title}</Text>
        {subtitle ? <Text variant="subheadline" color="textSecondary">{subtitle}</Text> : null}
      </View>
      <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? t.colors.accent : 'transparent', borderWidth: selected ? 0 : 1.5, borderColor: t.colors.separator }}>
        {selected ? (
          <Animated.View entering={ZoomIn.springify().damping(15).stiffness(200)}>
            <Icon name="checkmark" size={14} weight="bold" color={{ raw: '#013447' }} />
          </Animated.View>
        ) : null}
      </View>
    </Pressable>
  );
}
