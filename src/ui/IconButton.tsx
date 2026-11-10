import { View, type StyleProp, type ViewStyle } from 'react-native';

import { layout, radii, useTheme } from '@/theme';
import { GlassSurface } from './GlassSurface';
import { Icon } from './Icon';
import { Pressable } from './Pressable';
import type { IconName } from './symbols';
import { Text } from './Text';

type Props = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  glass?: boolean;
  size?: number;
  badge?: number | boolean;
  effectKey?: number;
  mirrorInRTL?: boolean;
  style?: StyleProp<ViewStyle>;
  tone?: 'tint' | 'primary';
};

/** 48 pt hit area. The glass variant floats over the map or a photo. */
export function IconButton({ icon, label, onPress, glass, size = layout.target, badge, effectKey, mirrorInRTL, style, tone = 'tint' }: Props) {
  const t = useTheme();
  const inner = (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={20} weight="medium" color={glass ? 'textPrimary' : tone === 'tint' ? 'tint' : 'textPrimary'} effect="bounce" effectKey={effectKey} mirrorInRTL={mirrorInRTL} />
      {badge ? (
        <View style={{ position: 'absolute', top: 7, end: 6, minWidth: typeof badge === 'number' ? 18 : 9, height: typeof badge === 'number' ? 18 : 9, borderRadius: 9, paddingHorizontal: 4, backgroundColor: t.colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: t.colors.bgPrimary }}>
          {typeof badge === 'number' ? <Text variant="caption2" weight="700" tabular style={{ color: '#013447' }} maxFontSizeMultiplier={1.2}>{badge}</Text> : null}
        </View>
      ) : null}
    </View>
  );
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4} style={style}>
      {glass ? <GlassSurface radius={radii.capsule} interactive>{inner}</GlassSurface> : inner}
    </Pressable>
  );
}
