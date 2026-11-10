import { memo } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { brand } from '@/theme/colors';

/**
 * Transparent hero illustrations for colour-block cards: chunky shapes, navy ink,
 * mint and white, a few sparkles. Drawn so they read on mint, mist, sand or navy.
 */
type Name = 'care' | 'calendar' | 'map' | 'court' | 'heart' | 'chair' | 'bell';

const INK = brand.navy;
const MINT = brand.mint;
const SAND = '#F6C58E';

function Spark({ x, y, s = 1, c = '#FFFFFF' }: { x: number; y: number; s?: number; c?: string }) {
  return <Path d={`M${x} ${y - 9 * s} L${x + 2.6 * s} ${y - 2.6 * s} L${x + 9 * s} ${y} L${x + 2.6 * s} ${y + 2.6 * s} L${x} ${y + 9 * s} L${x - 2.6 * s} ${y + 2.6 * s} L${x - 9 * s} ${y} L${x - 2.6 * s} ${y - 2.6 * s} Z`} fill={c} />;
}

function Chair({ x = 0, y = 0, s = 1, tint = MINT }: { x?: number; y?: number; s?: number; tint?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Circle cx={70} cy={120} r={42} fill="none" stroke={INK} strokeWidth={9} />
      <Circle cx={70} cy={120} r={30} fill="none" stroke={tint} strokeWidth={6} />
      <Circle cx={70} cy={120} r={7} fill={INK} />
      <Circle cx={142} cy={152} r={11} fill="none" stroke={INK} strokeWidth={7} />
      <Path d="M40 30 L52 30 L64 92 L132 92 L142 140" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M62 78 L120 78" stroke={tint} strokeWidth={10} strokeLinecap="round" />
    </G>
  );
}

export const HeroArt = memo(function HeroArt({ name, size }: { name: Name; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {name === 'care' ? (
        <G>
          <Circle cx={120} cy={92} r={70} fill="#FFFFFF" opacity={0.55} />
          <Chair x={30} y={20} s={0.95} />
          {/* person */}
          <Circle cx={92} cy={52} r={16} fill={INK} />
          <Path d="M86 70 C70 96 74 112 98 112 L128 112 L136 150" stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M92 80 L122 92" stroke={INK} strokeWidth={10} strokeLinecap="round" />
          {/* heart badge */}
          <Circle cx={160} cy={46} r={24} fill={INK} />
          <Path d="M160 58 C150 50 146 46 146 40 C146 35 150 32 154 32 C157 32 159 34 160 36 C161 34 163 32 166 32 C170 32 174 35 174 40 C174 46 170 50 160 58 Z" fill={MINT} />
          <Spark x={36} y={40} c={INK} s={0.8} />
          <Spark x={182} y={110} s={0.7} />
        </G>
      ) : name === 'calendar' ? (
        <G>
          <Rect x={40} y={46} width={126} height={118} rx={24} fill="#FFFFFF" />
          <Rect x={40} y={46} width={126} height={36} rx={18} fill={MINT} />
          <Rect x={40} y={64} width={126} height={18} fill={MINT} />
          <Rect x={66} y={32} width={12} height={30} rx={6} fill={INK} />
          <Rect x={128} y={32} width={12} height={30} rx={6} fill={INK} />
          {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <Circle key={`${r}${c}`} cx={64 + c * 26} cy={102 + r * 22} r={6} fill={r === 1 && c === 2 ? INK : 'rgba(1,52,71,0.18)'} />))}
          <Circle cx={116} cy={124} r={15} fill="none" stroke={MINT} strokeWidth={5} />
          <Spark x={176} y={44} c={INK} s={0.8} />
          <Spark x={28} y={150} s={0.7} c={SAND} />
        </G>
      ) : name === 'map' ? (
        <G>
          <Path d="M30 70 L76 52 L124 70 L170 52 L170 158 L124 176 L76 158 L30 176 Z" fill="#FFFFFF" />
          <Path d="M76 52 L76 158 M124 70 L124 176" stroke="rgba(1,52,71,0.15)" strokeWidth={4} />
          <Path d="M48 140 C70 120 96 150 118 124 C130 110 146 112 158 100" stroke={MINT} strokeWidth={6} strokeDasharray="2 12" strokeLinecap="round" fill="none" />
          <Path d="M120 24 C96 24 82 42 82 62 C82 90 120 120 120 120 C120 120 158 90 158 62 C158 42 144 24 120 24 Z" fill={INK} />
          <Circle cx={120} cy={62} r={18} fill={MINT} />
          <Path d="M111 62 L118 69 L130 56" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Spark x={176} y={34} c={INK} s={0.8} />
        </G>
      ) : name === 'court' ? (
        <G>
          <Rect x={96} y={20} width={64} height={44} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
          <Rect x={116} y={36} width={24} height={16} rx={3} fill="none" stroke={INK} strokeWidth={4} />
          <Path d="M110 64 L114 86 L142 86 L146 64" stroke={INK} strokeWidth={5} fill="none" />
          <Path d="M128 64 L128 190" stroke={INK} strokeWidth={8} />
          <Circle cx={66} cy={70} r={26} fill={SAND} stroke={INK} strokeWidth={5} />
          <Path d="M40 70 L92 70 M66 44 L66 96 M48 52 C60 62 60 78 48 88 M84 52 C72 62 72 78 84 88" stroke={INK} strokeWidth={3.5} fill="none" />
          <Chair x={40} y={84} s={0.62} />
          <Spark x={30} y={30} c={INK} s={0.8} />
          <Spark x={180} y={96} s={0.7} />
        </G>
      ) : name === 'heart' ? (
        <G>
          <Path d="M100 172 C40 130 22 104 22 74 C22 48 42 30 66 30 C82 30 94 40 100 52 C106 40 118 30 134 30 C158 30 178 48 178 74 C178 104 160 130 100 172 Z" fill={INK} />
          <Path d="M100 140 C66 116 56 100 56 82 C56 68 66 58 80 58 C90 58 96 64 100 72 C104 64 110 58 120 58 C134 58 144 68 144 82 C144 100 134 116 100 140 Z" fill={MINT} />
          <Spark x={176} y={30} c="#FFFFFF" />
          <Spark x={24} y={160} c={INK} s={0.7} />
        </G>
      ) : name === 'chair' ? (
        <G>
          <Circle cx={110} cy={100} r={74} fill="#FFFFFF" opacity={0.5} />
          <Chair x={14} y={10} s={1.05} />
          <Spark x={170} y={40} c={INK} s={0.9} />
          <Spark x={30} y={34} s={0.7} c="#FFFFFF" />
        </G>
      ) : (
        <G>
          <Circle cx={100} cy={100} r={78} fill={brand.mintMist} />
          <Spark x={182} y={150} c={MINT} s={0.8} />
          <Path d="M100 30 C72 30 56 52 56 80 L56 116 L42 138 L158 138 L144 116 L144 80 C144 52 128 30 100 30 Z" fill={INK} />
          <Circle cx={100} cy={152} r={14} fill={INK} />
          <Circle cx={146} cy={50} r={20} fill={MINT} stroke="#FFFFFF" strokeWidth={5} />
          <Path d="M30 70 C24 86 24 100 30 116 M170 70 C176 86 176 100 170 116" stroke={MINT} strokeWidth={6} strokeLinecap="round" fill="none" />
        </G>
      )}
    </Svg>
  );
});
