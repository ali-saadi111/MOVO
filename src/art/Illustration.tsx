import { memo } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

/** Welcome illustrations: flat Navy and Mint on Mint Mist, one line weight. */
export const Illustration = memo(function Illustration({ name, size }: { name: 'map' | 'shop' | 'community' | 'empty'; size: number }) {
  const { colors: c } = useTheme();
  const ink = c.illoInk;
  const acc = c.illoAccent;
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Circle cx={120} cy={120} r={112} fill={c.illoBg} />
      {name === 'map' && (
        <G>
          <Path d="M40 80 L92 60 L148 80 L200 60 L200 172 L148 192 L92 172 L40 192 Z" fill={c.illoWarm} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
          <Path d="M92 60 L92 172 M148 80 L148 192" stroke={ink} strokeWidth={3} opacity={0.4} />
          <Path d="M52 150 Q100 110 128 140 T190 100" stroke={acc} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="2 12" />
          <G transform="translate(104 58)">
            <Path d="M16 0 C30 0 36 10 36 20 C36 34 16 52 16 52 C16 52 -4 34 -4 20 C-4 10 2 0 16 0 Z" fill={acc} stroke={ink} strokeWidth={4} />
            <Path d="M7 20 L14 27 L26 14" stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </G>
          <Circle cx={60} cy={150} r={7} fill={ink} />
          <Circle cx={182} cy={104} r={7} fill={ink} />
        </G>
      )}
      {name === 'shop' && (
        <G>
          <Rect x={48} y={92} width={88} height={96} rx={12} fill={c.illoWarm} stroke={ink} strokeWidth={4} />
          <Path d="M70 92 L70 76 Q70 58 92 58 Q114 58 114 76 L114 92" stroke={ink} strokeWidth={4} fill="none" />
          <Rect x={66} y={118} width={52} height={10} rx={5} fill={acc} />
          <Rect x={124} y={110} width={72} height={78} rx={14} fill={acc} stroke={ink} strokeWidth={4} />
          <Path d="M160 128 L160 170 M139 149 L181 149" stroke={ink} strokeWidth={8} strokeLinecap="round" />
        </G>
      )}
      {name === 'community' && (
        <G>
          {[70, 120, 170].map((x, i) => (
            <G key={x}>
              <Circle cx={x} cy={i === 1 ? 84 : 100} r={18} fill={i === 1 ? acc : c.illoWarm} stroke={ink} strokeWidth={4} />
              <Path d={`M${x - 30} ${i === 1 ? 170 : 180} Q${x - 30} ${i === 1 ? 116 : 130} ${x} ${i === 1 ? 116 : 130} Q${x + 30} ${i === 1 ? 116 : 130} ${x + 30} ${i === 1 ? 170 : 180}`} fill={i === 1 ? c.illoWarm : acc} stroke={ink} strokeWidth={4} />
            </G>
          ))}
          <Path d="M104 46 C104 36 120 36 120 46 C120 36 136 36 136 46 C136 58 120 66 120 70 C120 66 104 58 104 46 Z" fill={acc} stroke={ink} strokeWidth={3} />
        </G>
      )}
      {name === 'empty' && (
        <G>
          <Circle cx={120} cy={120} r={44} fill={c.illoWarm} stroke={ink} strokeWidth={4} />
          <Path d="M100 120 L114 134 L142 106" stroke={acc} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </G>
      )}
    </Svg>
  );
});
