import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, Switch as RNSwitch, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { ZoomIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { continuous, layout, radii, space, springs, useTheme } from '@/theme';
import { bodyFont } from '@/theme/fonts';
import { Icon } from './Icon';
import type { IconName } from './symbols';
import { TabIcon, type TabGlyph } from './TabIcon';
import { Pressable } from './Pressable';
import { Text } from './Text';
 

/** Chip. Selected shows a ✓, never colour alone. */
export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: ReactNode }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => { haptic.selection(); onPress?.(); }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      style={{
        minHeight: 40,
        marginVertical: 4,
        paddingHorizontal: space.md,
        borderRadius: radii.capsule,
        ...continuous,
        backgroundColor: selected ? t.colors.buttonPrimaryBg : t.colors.bgElevated,
        borderWidth: 1,
        borderColor: selected ? t.colors.buttonPrimaryBg : t.colors.separator,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {selected ? (
        <Animated.View entering={t.reduceMotion ? undefined : ZoomIn.springify().damping(15).stiffness(200)}>
          <Icon name="checkmark" size={14} weight="bold" color={{ raw: t.colors.buttonPrimaryFg }} />
        </Animated.View>
      ) : icon}
      <Text variant="subheadline" weight={selected ? '700' : '500'} maxFontSizeMultiplier={1.8} style={selected ? { color: t.colors.buttonPrimaryFg } : undefined}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow<T extends string>({ options, value, onChange, multi, style, inset = layout.margin, leading }: { options: { value: T; label: string }[]; value: T | T[]; onChange: (v: T) => void; multi?: boolean; style?: StyleProp<ViewStyle>; inset?: number; leading?: ReactNode }) {
  const isSel = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: inset, gap: space.xs }} style={style} accessibilityRole={multi ? undefined : 'radiogroup'}>
      {leading}
      {options.map((o) => <Chip key={o.value} label={o.label} selected={isSel(o.value)} onPress={() => onChange(o.value)} />)}
    </ScrollView>
  );
}

export function ChipWrap<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T[] | T | null; onChange: (v: T) => void }) {
  const isSel = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
      {options.map((o) => <Chip key={o.value} label={o.label} selected={isSel(o.value)} onPress={() => onChange(o.value)} />)}
    </View>
  );
}

/**
 * Segmented control: a capsule with a navy pill that springs to the chosen
 * option, optional icons, and a bare track for use on glass (the map's Map/List).
 */
export function Segmented({ values, index, onChange, style, icons, glass, glyphs }: { values: string[]; index: number; onChange: (i: number) => void; style?: StyleProp<ViewStyle>; icons?: IconName[]; glass?: boolean; glyphs?: TabGlyph[] }) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const x = useSharedValue(index);
  useEffect(() => { x.value = t.reduceMotion ? index : withSpring(index, springs.snappy); }, [index, x, t.reduceMotion]);
  const pad = 4;
  const seg = w ? (w - pad * 2) / values.length : 0;
  const pill = useAnimatedStyle(() => ({ width: seg, transform: [{ translateX: (t.rtl ? -1 : 1) * x.value * seg }] }));
  const dark = t.scheme === 'dark';
  return (
    <View accessibilityRole="tablist" onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[{ height: 44, borderRadius: 22, padding: pad, flexDirection: 'row', backgroundColor: glass ? 'transparent' : t.colors.bgElevated, borderWidth: glass ? 0 : 1, borderColor: t.colors.separator }, style]}>
      {w ? <Animated.View style={[{ position: 'absolute', top: pad, bottom: pad, ...(t.rtl ? { right: pad } : { left: pad }), borderRadius: 18, backgroundColor: t.colors.buttonPrimaryBg, boxShadow: dark ? undefined : '0 3px 10px rgba(1,52,71,0.22)' }, pill]} /> : null}
      {values.map((v, i) => {
        const on = i === index;
        const ink = on ? t.colors.buttonPrimaryFg : t.colors.textSecondary;
        return (
          <Pressable key={v} feedback="none" onPress={() => { if (!on) { haptic.selection(); onChange(i); } }} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={v}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {glyphs?.[i] ? <TabIcon name={glyphs[i]} on={on} ink={ink} fill={dark ? 'rgba(1,52,71,0.25)' : '#3CE0AA'} size={18} /> : null}
            {icons?.[i] ? <Icon name={icons[i]} size={15} weight="semibold" color={{ raw: ink }} fill={on} /> : null}
            <Text variant="subheadline" weight={on ? '700' : '600'} style={{ color: ink }} maxFontSizeMultiplier={1.4}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Switch({ value, onValueChange, label }: { value: boolean; onValueChange: (v: boolean) => void; label: string }) {
  const t = useTheme();
  return (
    <RNSwitch
      value={value}
      onValueChange={(v) => { haptic.selection(); onValueChange(v); }}
      trackColor={{ true: t.colors.accent, false: t.colors.fillStrong }}
      ios_backgroundColor={t.colors.fillStrong}
      thumbColor="#FFFFFF"
      accessibilityLabel={label}
    />
  );
}

/** − qty +. Removing the last unit asks first (onRemoveLast). */
export function Stepper({ value, onChange, onRemoveLast, min = 1, max = 10, label }: { value: number; onChange: (n: number) => void; onRemoveLast?: () => void; min?: number; max?: number; label: string }) {
  const t = useTheme();
  const btn = (icon: 'minus' | 'plus' | 'trash', onPress: () => void, a11y: string, disabled?: boolean) => (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={a11y} style={{ width: layout.target, height: 40, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : 1 }}>
      <Icon name={icon} size={15} weight="semibold" color="textPrimary" />
    </Pressable>
  );
  return (
    <View accessibilityLabel={label} accessibilityValue={{ now: value }} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.colors.fill, borderRadius: radii.capsule, ...continuous, alignSelf: 'flex-start' }}>
      {value <= min && onRemoveLast ? btn('trash', onRemoveLast, 'Remove') : btn('minus', () => { haptic.selection(); onChange(value - 1); }, 'Decrease', value <= min)}
      <Text variant="headline" tabular style={{ minWidth: 24, textAlign: 'center' }}>{value}</Text>
      {btn('plus', () => { haptic.selection(); onChange(value + 1); }, 'Increase', value >= max)}
    </View>
  );
}

export function StarRating({ value, onChange, size = 28, label }: { value: number; onChange?: (n: number) => void; size?: number; label: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: onChange ? 4 : 1 }} accessibilityLabel={`${label}: ${value} of 5`} accessibilityRole={onChange ? 'adjustable' : 'text'}>
      {[1, 2, 3, 4, 5].map((n) => {
        const name = value >= n ? 'star.fill' : value >= n - 0.5 ? 'star.leadinghalf.filled' : 'star';
        const icon = <Icon name={name} size={size} color={value >= n - 0.5 ? 'accent' : 'textTertiary'} mirrorInRTL={name === 'star.leadinghalf.filled'} />;
        return onChange ? (
          <Pressable key={n} onPress={() => { haptic.selection(); onChange(n); }} accessibilityRole="button" accessibilityLabel={`${n} stars`} style={{ width: layout.target, height: layout.target, alignItems: 'center', justifyContent: 'center' }}>
            <PopOnSelect active={value >= n}>{icon}</PopOnSelect>
          </Pressable>
        ) : <View key={n}>{icon}</View>;
      })}
    </View>
  );
}

function PopOnSelect({ active, children }: { active: boolean; children: ReactNode }) {
  const t = useTheme();
  const s = useSharedValue(1);
  useEffect(() => {
    if (active && !t.reduceMotion) { s.value = 0.7; s.value = withSpring(1, springs.bouncy); }
  }, [active, s, t.reduceMotion]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={st}>{children}</Animated.View>;
}

export function TextField({ label, value, onChangeText, helper, error, secure, multiline, maxLength, placeholder, keyboardType, autoComplete, textContentType }: {
  label: string; value: string; onChangeText: (s: string) => void; helper?: string; error?: string | null; secure?: boolean; multiline?: boolean; maxLength?: number; placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad'; autoComplete?: 'email' | 'password' | 'name' | 'tel' | 'off'; textContentType?: 'emailAddress' | 'password' | 'name' | 'telephoneNumber' | 'newPassword' | 'none';
}) {
  const t = useTheme();
  const [hidden, setHidden] = useState(!!secure);
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: space.xs }}>
      <Text variant="subheadline" weight="600">{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', minHeight: multiline ? 120 : layout.target + 4, borderRadius: radii.input, ...continuous, backgroundColor: t.colors.fill, borderWidth: error ? 1.5 : focus || t.highContrast ? 1.5 : 0, borderColor: error ? t.colors.danger : focus ? t.colors.tint : t.colors.separator, paddingHorizontal: space.md }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          multiline={multiline}
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor={t.colors.textTertiary}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCapitalize={keyboardType === 'email-address' || secure ? 'none' : 'sentences'}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          accessibilityLabel={label}
          style={{ flex: 1, fontSize: 17, fontFamily: bodyFont(t.rtl), color: t.colors.textPrimary, paddingVertical: space.sm, textAlign: t.rtl ? 'right' : 'left', minHeight: multiline ? 110 : undefined, textAlignVertical: multiline ? 'top' : 'center', outlineStyle: 'none' } as never}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'} style={{ width: layout.target, height: layout.target, alignItems: 'center', justifyContent: 'center', marginEnd: -space.sm }}>
            <Icon name={hidden ? 'eye' : 'eye.slash'} size={18} color="textSecondary" />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Icon name="exclamationmark.triangle" size={14} color="danger" />
          <Text variant="footnote" color="danger">{error}</Text>
        </View>
      ) : helper || maxLength ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="footnote" color="textSecondary">{helper ?? ''}</Text>
          {maxLength ? <Text variant="footnote" color="textSecondary" tabular>{value.length}/{maxLength}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}
