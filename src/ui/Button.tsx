import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { continuous, layout, radii, space, useTheme } from '@/theme';
import { Icon } from './Icon';
import { Pressable } from './Pressable';
import type { IconName } from './symbols';
import { Text } from './Text';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'plain' | 'destructive' | 'onBrand';
  size?: 'large' | 'medium';
  icon?: IconName;
  loading?: boolean;
  /** When set the button is disabled and says what is missing ("Choose a time"). */
  disabledReason?: string | null;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

/** Capsule button. The label cross-fades when it changes. */
export function Button({ label, onPress, variant = 'primary', size = 'large', icon, loading, disabledReason, fullWidth = true, style, accessibilityHint }: ButtonProps) {
  const t = useTheme();
  const disabled = !!disabledReason || loading;
  const shown = disabledReason ?? label;
  const first = useRef(true);
  const [k, setK] = useState(0);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setK((n) => n + 1);
  }, [shown]);

  const palette = {
    primary: { bg: t.colors.buttonPrimaryBg, fg: 'buttonPrimaryFg' as const },
    secondary: { bg: t.colors.buttonSecondaryBg, fg: 'buttonSecondaryFg' as const },
    plain: { bg: 'transparent', fg: 'tint' as const },
    destructive: { bg: t.scheme === 'dark' ? 'rgba(248,113,113,0.16)' : 'rgba(197,48,48,0.08)', fg: 'danger' as const },
    onBrand: { bg: t.colors.accent, fg: 'buttonSecondaryFg' as const },
  }[variant];
  const fg = variant === 'onBrand' ? '#013447' : t.colors[palette.fg];
  const disabledBg = t.colors.fill;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={shown}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[
        {
          minHeight: size === 'large' ? 52 : layout.target,
          paddingHorizontal: variant === 'plain' ? space.sm : space.xl,
          borderRadius: radii.capsule,
          ...continuous,
          backgroundColor: disabledReason ? disabledBg : palette.bg,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          flexDirection: 'row',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Animated.View key={k} entering={k ? FadeIn.duration(200) : undefined} exiting={FadeOut.duration(120)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingVertical: space.xs }}>
          {icon && !disabledReason ? <Icon name={icon} size={17} weight="semibold" color={{ raw: fg }} /> : null}
          <Text variant="headline" style={{ color: disabledReason ? t.colors.textSecondary : fg }} tabular numberOfLines={2} align="center">
            {shown}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

export function ButtonRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: space.sm }}>{children}</View>;
}
