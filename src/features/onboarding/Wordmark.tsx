import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { brand } from '@/theme/colors';
import { useTheme } from '@/theme';
import { Text } from '@/ui/Text';

/** Lexend is for the wordmark only (open question 2); system font stands in until bundled. */
export function Wordmark({ size = 34 }: { size?: number }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, direction: 'ltr' }} accessibilityRole="header" accessibilityLabel="Movo">
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Circle cx={20} cy={20} r={20} fill={t.scheme === 'dark' ? brand.mint : brand.navy} />
        <Path d="M10 27 L10 15 L20 23 L30 15 L30 27" stroke={t.scheme === 'dark' ? brand.navy : brand.mint} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text variant="title2" display weight="700" style={{ fontSize: size * 0.82 }}>movo</Text>
    </View>
  );
}
