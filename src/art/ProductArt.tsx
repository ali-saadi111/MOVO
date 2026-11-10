import { memo, type ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { brand } from '@/theme/colors';

/**
 * Drawn product artwork in one line weight, Navy ink with a Mint accent, on the
 * white product tile. Stands in for product photos (the build environment had no
 * web access). Views: 0 three-quarter, 1 close-up, 2 mirrored, 3 detail.
 */
const INK = brand.navy;
const ACC = brand.mint;
const SOFT = '#D9F4EA';
const GREY = '#C9D3D6';
const sw = 3.2;

const wheel = (cx: number, cy: number, r: number, spokes = 8, hub = 4) => (
  <G>
    <Circle cx={cx} cy={cy} r={r} stroke={INK} strokeWidth={sw * 1.4} fill="none" />
    <Circle cx={cx} cy={cy} r={r - 6} stroke={GREY} strokeWidth={1.4} fill="none" />
    {Array.from({ length: spokes }, (_, i) => {
      const a = (i / spokes) * Math.PI * 2;
      return <Line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * (r - 6)} y2={cy + Math.sin(a) * (r - 6)} stroke={GREY} strokeWidth={1.2} />;
    })}
    <Circle cx={cx} cy={cy} r={hub} fill={INK} />
  </G>
);
const caster = (cx: number, cy: number) => (
  <G>
    <Line x1={cx} y1={cy - 14} x2={cx} y2={cy - 6} stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    <Circle cx={cx} cy={cy} r={7} stroke={INK} strokeWidth={sw} fill="#fff" />
  </G>
);

const wheelchair = (variant: 'std' | 'light' | 'transport' | 'power') => (
  <G>
    <Ellipse cx={100} cy={172} rx={70} ry={6} fill="#EEF2F3" />
    {/* backrest */}
    <Path d="M70 40 L76 112" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    <Path d="M64 38 L72 36" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    <Path d="M74 52 L82 104 L130 104 L128 96 L80 96" fill={variant === 'power' ? INK : ACC} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    {/* seat */}
    <Path d="M76 112 L138 112" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    <Path d="M80 108 Q108 116 134 108" stroke={variant === 'power' ? ACC : SOFT} strokeWidth={6} fill="none" strokeLinecap="round" />
    {/* armrest */}
    <Path d="M78 84 L124 84 L128 112" stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* front frame and footrest */}
    <Path d="M134 112 L150 150 L166 150" stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M76 112 L80 140 L142 140" stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />
    {variant === 'transport' ? (
      <G>{wheel(84, 150, 18, 6)}{caster(146, 164)}</G>
    ) : (
      <G>{wheel(86, 128, variant === 'power' ? 32 : 40, variant === 'light' ? 6 : 10)}{caster(146, 164)}</G>
    )}
    {variant === 'power' && (
      <G>
        <Rect x={92} y={118} width={36} height={18} rx={4} fill={INK} />
        <Path d="M124 84 L132 76" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <Circle cx={133} cy={74} r={4} fill={ACC} />
      </G>
    )}
    {variant !== 'transport' && <Circle cx={86} cy={128} r={variant === 'power' ? 27 : 35} stroke={ACC} strokeWidth={2} fill="none" opacity={0.9} />}
    <Path d="M70 40 L60 38" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
  </G>
);

const walker = (wheels: boolean, seat: boolean) => (
  <G>
    <Ellipse cx={100} cy={172} rx={60} ry={5} fill="#EEF2F3" />
    <Path d="M66 44 L56 164 M134 44 L144 164 M66 44 L134 44" stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />
    <Path d="M62 90 L138 90" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    <Rect x={58} y={36} width={18} height={12} rx={5} fill={ACC} />
    <Rect x={124} y={36} width={18} height={12} rx={5} fill={ACC} />
    {seat && <Rect x={62} y={100} width={76} height={10} rx={4} fill={INK} />}
    {seat && <Path d="M70 112 Q100 134 130 112" stroke={GREY} strokeWidth={2} fill={SOFT} />}
    {wheels ? (
      <G>
        <Circle cx={56} cy={162} r={10} stroke={INK} strokeWidth={sw} fill="#fff" />
        <Circle cx={144} cy={162} r={10} stroke={INK} strokeWidth={sw} fill="#fff" />
        <Path d="M66 58 Q60 70 70 74" stroke={INK} strokeWidth={1.6} fill="none" />
      </G>
    ) : (
      <G>
        <Rect x={50} y={160} width={12} height={8} rx={3} fill={INK} />
        <Rect x={138} y={160} width={12} height={8} rx={3} fill={INK} />
      </G>
    )}
  </G>
);

const crutches = () => (
  <G>
    <Ellipse cx={100} cy={174} rx={50} ry={5} fill="#EEF2F3" />
    {[78, 118].map((x, i) => (
      <G key={x} transform={`rotate(${i ? 6 : -6} ${x} 100)`}>
        <Path d={`M${x - 10} 30 A10 10 0 0 1 ${x + 10} 30`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <Line x1={x} y1={32} x2={x} y2={168} stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <Rect x={x - 3} y={74} width={18} height={9} rx={4} fill={ACC} />
        <Rect x={x - 4} y={164} width={8} height={9} rx={3} fill={INK} />
        {Array.from({ length: 5 }, (_, k) => <Circle key={k} cx={x} cy={110 + k * 9} r={1.6} fill="#fff" />)}
      </G>
    ))}
  </G>
);

const cane = (quad: boolean) => (
  <G>
    <Ellipse cx={100} cy={174} rx={40} ry={5} fill="#EEF2F3" />
    <Path d="M78 40 Q78 26 92 26 L104 26" stroke={INK} strokeWidth={sw * 1.6} fill="none" strokeLinecap="round" />
    <Path d="M76 44 Q76 38 82 36" stroke={ACC} strokeWidth={sw * 2.6} strokeLinecap="round" />
    <Line x1={78} y1={40} x2={98} y2={160} stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" />
    {[0, 1, 2].map((k) => <Line key={k} x1={84 + k * 3.4} y1={78 + k * 20} x2={90 + k * 3.4} y2={77 + k * 20} stroke="#fff" strokeWidth={2} />)}
    {quad ? (
      <Path d="M80 160 L120 160 M84 160 L80 172 M116 160 L120 172 M94 160 L92 172 M106 160 L108 172" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    ) : (
      <Rect x={94} y={158} width={10} height={12} rx={4} fill={INK} />
    )}
  </G>
);

const chair = (kind: 'shower' | 'bench' | 'commode') => (
  <G>
    <Ellipse cx={100} cy={172} rx={64} ry={5} fill="#EEF2F3" />
    {kind !== 'bench' && <Path d="M62 50 L62 104 M138 50 L138 104 M62 56 L138 56" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
    {kind !== 'bench' && <Rect x={66} y={60} width={68} height={28} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />}
    <Rect x={kind === 'bench' ? 34 : 54} y={100} width={kind === 'bench' ? 132 : 92} height={14} rx={6} fill={kind === 'commode' ? INK : ACC} stroke={INK} strokeWidth={2} />
    {kind === 'commode' && <Ellipse cx={100} cy={107} rx={24} ry={4} fill="#fff" />}
    {Array.from({ length: kind === 'bench' ? 8 : 5 }, (_, k) => <Circle key={k} cx={(kind === 'bench' ? 46 : 66) + k * 15} cy={107} r={2} fill="#fff" opacity={kind === 'commode' ? 0 : 1} />)}
    <Path d={kind === 'bench' ? 'M44 114 L38 168 M156 114 L162 168 M100 114 L100 168' : 'M62 114 L56 168 M138 114 L144 168'} stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    <Path d={kind === 'bench' ? 'M42 140 L158 140' : 'M60 140 L140 140'} stroke={GREY} strokeWidth={2} />
    {(kind === 'bench' ? [38, 162, 100] : [56, 144]).map((x) => <Rect key={x} x={x - 6} y={166} width={12} height={6} rx={3} fill={INK} />)}
    {kind === 'bench' && <Path d="M130 100 L130 52 L166 52 L166 100" stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
  </G>
);

const toiletSeat = () => (
  <G>
    <Ellipse cx={100} cy={170} rx={62} ry={6} fill="#EEF2F3" />
    <Path d="M46 98 Q46 70 100 70 Q154 70 154 98 L150 130 L50 130 Z" fill="#fff" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    <Ellipse cx={100} cy={96} rx={34} ry={14} fill={SOFT} stroke={INK} strokeWidth={2} />
    <Path d="M36 92 L36 132 M164 92 L164 132 M36 92 L56 92 M144 92 L164 92" stroke={ACC} strokeWidth={sw * 1.6} strokeLinecap="round" />
    <Path d="M36 132 L32 166 M164 132 L168 166" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
  </G>
);

const grabBar = () => (
  <G>
    <Rect x={20} y={88} width={160} height={24} rx={12} fill="#EEF2F3" />
    <Path d="M40 120 L40 98 Q40 86 52 86 L148 86 Q160 86 160 98 L160 120" stroke={INK} strokeWidth={sw * 2.2} fill="none" strokeLinecap="round" />
    {[46, 154].map((x) => <Circle key={x} cx={x - 6} cy={124} r={12} fill="#fff" stroke={INK} strokeWidth={sw} />)}
    {[40, 148].map((x) => <Circle key={x} cx={x} cy={124} r={3} fill={ACC} />)}
    {Array.from({ length: 12 }, (_, k) => <Line key={k} x1={66 + k * 6} y1={82} x2={70 + k * 6} y2={90} stroke={ACC} strokeWidth={1.6} />)}
  </G>
);

const reacher = () => (
  <G>
    <Line x1={36} y1={160} x2={160} y2={40} stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />
    <Path d="M28 150 L56 150 L60 176 L34 176 Z" fill={ACC} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    <Path d="M46 150 Q54 136 62 146" stroke={INK} strokeWidth={sw} fill="none" />
    <Path d="M156 44 L174 30 M160 40 L178 44" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    <Rect x={170} y={24} width={10} height={8} rx={3} fill={ACC} />
    <Rect x={174} y={40} width={10} height={8} rx={3} fill={ACC} />
  </G>
);

const sockAid = () => (
  <G>
    <Path d="M70 70 Q100 56 130 70 L124 128 Q100 140 76 128 Z" fill={SOFT} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    <Path d="M76 70 Q60 110 36 170 M124 70 Q140 110 164 170" stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />
    <Circle cx={36} cy={172} r={6} fill={ACC} />
    <Circle cx={164} cy={172} r={6} fill={ACC} />
  </G>
);

const utensils = () => (
  <G>
    {[60, 100, 140].map((x, i) => (
      <G key={x}>
        <Rect x={x - 11} y={104} width={22} height={66} rx={11} fill={i === 1 ? ACC : SOFT} stroke={INK} strokeWidth={2} />
        <Line x1={x} y1={104} x2={x} y2={60} stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        {i === 0 && <Path d={`M${x - 8} 28 L${x - 8} 56 Q${x} 64 ${x + 8} 56 L${x + 8} 28 M${x} 30 L${x} 56`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />}
        {i === 1 && <Ellipse cx={x} cy={42} rx={11} ry={18} fill="#fff" stroke={INK} strokeWidth={sw} />}
        {i === 2 && <Path d={`M${x - 4} 26 Q${x + 12} 36 ${x + 4} 60 L${x - 4} 60 Z`} fill="#fff" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />}
      </G>
    ))}
  </G>
);

const pillBox = () => (
  <G>
    <Rect x={24} y={86} width={152} height={52} rx={10} fill="#fff" stroke={INK} strokeWidth={sw} />
    {Array.from({ length: 7 }, (_, k) => (
      <G key={k}>
        <Rect x={30 + k * 20.5} y={92} width={17} height={40} rx={5} fill={k === 2 ? ACC : SOFT} />
        <Circle cx={38.5 + k * 20.5} cy={118} r={3.4} fill={k === 2 ? '#fff' : INK} opacity={k % 2 ? 0.5 : 1} />
      </G>
    ))}
    <Rect x={24} y={70} width={152} height={14} rx={6} fill={INK} />
  </G>
);

const bedRail = () => (
  <G>
    <Rect x={20} y={120} width={160} height={30} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />
    <Path d="M60 120 L60 56 Q60 46 70 46 L130 46 Q140 46 140 56 L140 120" stroke={INK} strokeWidth={sw * 1.6} fill="none" />
    <Path d="M80 46 L80 120 M100 46 L100 120 M120 46 L120 120" stroke={INK} strokeWidth={sw * 0.8} />
    <Rect x={54} y={70} width={12} height={22} rx={5} fill={ACC} />
    <Path d="M60 150 L60 176 M140 150 L140 176" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
  </G>
);

const cushion = () => (
  <G>
    <Ellipse cx={100} cy={160} rx={70} ry={8} fill="#EEF2F3" />
    <Path d="M30 112 Q30 84 60 84 L140 84 Q170 84 170 112 L170 132 Q170 150 150 150 L50 150 Q30 150 30 132 Z" fill={SOFT} stroke={INK} strokeWidth={sw} />
    <Path d="M42 108 Q100 92 158 108" stroke={ACC} strokeWidth={sw * 2} fill="none" strokeLinecap="round" />
    {Array.from({ length: 5 }, (_, k) => <Circle key={k} cx={56 + k * 22} cy={128} r={6} fill="#fff" stroke={INK} strokeWidth={1.4} />)}
  </G>
);

const glove = (accent: string) => (
  <G>
    <Path d="M72 170 L72 110 L60 70 Q58 60 66 58 Q73 57 76 66 L86 96 L84 44 Q84 34 92 34 Q100 34 100 44 L102 92 L108 40 Q110 30 118 32 Q126 34 124 44 L118 96 L132 54 Q136 46 143 48 Q150 52 147 60 L132 118 L130 170 Z" fill="#fff" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    <Rect x={72} y={150} width={58} height={20} rx={4} fill={accent} />
  </G>
);

const briefs = () => (
  <G>
    <Rect x={44} y={40} width={112} height={128} rx={14} fill={SOFT} stroke={INK} strokeWidth={sw} />
    <Rect x={44} y={40} width={112} height={30} rx={14} fill={INK} />
    <Path d="M70 100 Q100 130 130 100" stroke={ACC} strokeWidth={sw * 2} fill="none" strokeLinecap="round" />
    <Rect x={74} y={140} width={52} height={10} rx={5} fill="#fff" />
  </G>
);

const stockings = () => (
  <G>
    {[80, 122].map((x, i) => (
      <Path key={x} d={`M${x - 14} 30 L${x + 14} 30 L${x + 12} 132 Q${x + 12} 158 ${x + 40} 160 Q${x + 50} 170 ${x + 36} 176 L${x - 2} 176 Q${x - 16} 174 ${x - 14} 150 Z`} fill={i ? '#fff' : SOFT} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    ))}
    <Path d="M66 44 L94 44 M108 44 L136 44" stroke={ACC} strokeWidth={sw * 1.8} />
  </G>
);

const firstAid = () => (
  <G>
    <Rect x={30} y={62} width={140} height={100} rx={16} fill="#fff" stroke={INK} strokeWidth={sw} />
    <Path d="M78 62 L78 48 Q78 42 84 42 L116 42 Q122 42 122 48 L122 62" stroke={INK} strokeWidth={sw} fill="none" />
    <Rect x={88} y={86} width={24} height={56} rx={4} fill={ACC} />
    <Rect x={72} y={102} width={56} height={24} rx={4} fill={ACC} />
  </G>
);

const ramp = (threshold: boolean) => (
  <G>
    <Ellipse cx={100} cy={160} rx={80} ry={6} fill="#EEF2F3" />
    {threshold ? (
      <G>
        <Path d="M24 150 L76 114 L124 114 L176 150 Z" fill={INK} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        {Array.from({ length: 9 }, (_, k) => <Line key={k} x1={40 + k * 15} y1={146} x2={56 + k * 11} y2={120} stroke="#fff" strokeWidth={1.4} opacity={0.6} />)}
        <Rect x={76} y={108} width={48} height={6} rx={3} fill={ACC} />
      </G>
    ) : (
      <G>
        <Path d="M20 154 L168 74 L178 74 L178 154 Z" fill={SOFT} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        {Array.from({ length: 10 }, (_, k) => <Line key={k} x1={34 + k * 14} y1={146 - k * 7.6} x2={34 + k * 14} y2={154} stroke={GREY} strokeWidth={1.2} />)}
        <Path d="M20 154 L168 74" stroke={ACC} strokeWidth={sw * 1.6} strokeLinecap="round" />
        <Path d="M96 112 L96 134 L118 134 L118 100" stroke={INK} strokeWidth={sw} fill="none" />
        <Rect x={100} y={128} width={14} height={6} rx={3} fill={INK} />
      </G>
    )}
  </G>
);

const hinge = () => (
  <G>
    {[64, 136].map((x, i) => (
      <G key={x} transform={`rotate(${i ? 8 : -8} ${x} 100)`}>
        <Rect x={x - 26} y={40} width={52} height={120} rx={6} fill="#fff" stroke={INK} strokeWidth={sw} />
        <Rect x={x - 6} y={40} width={12} height={120} rx={4} fill={ACC} />
        {[60, 100, 140].map((y) => <Circle key={y} cx={x - 15} cy={y} r={4} fill={INK} />)}
        {[60, 100, 140].map((y) => <Circle key={y} cx={x + 15} cy={y} r={4} fill={INK} />)}
      </G>
    ))}
  </G>
);

const stairRail = () => (
  <G>
    <Path d="M20 170 L20 146 L56 146 L56 122 L92 122 L92 98 L128 98 L128 74 L164 74 L164 170 Z" fill={SOFT} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    <Path d="M26 108 L170 36" stroke={INK} strokeWidth={sw * 1.8} strokeLinecap="round" />
    {[44, 92, 140].map((x) => <Line key={x} x1={x} y1={108 - (x - 26) / 2} x2={x} y2={146 - Math.floor((x - 20) / 36) * 24} stroke={ACC} strokeWidth={sw} />)}
  </G>
);

const tyre = (tube: boolean) => (
  <G>
    <Circle cx={100} cy={100} r={68} stroke={INK} strokeWidth={tube ? 10 : 18} fill="none" />
    {!tube && Array.from({ length: 36 }, (_, k) => { const a = (k / 36) * Math.PI * 2; return <Line key={k} x1={100 + Math.cos(a) * 60} y1={100 + Math.sin(a) * 60} x2={100 + Math.cos(a) * 76} y2={100 + Math.sin(a) * 76} stroke="#fff" strokeWidth={1.6} opacity={0.5} />; })}
    <Circle cx={100} cy={100} r={52} stroke={tube ? ACC : GREY} strokeWidth={tube ? 6 : 1.5} fill="none" />
    {tube && <Rect x={96} y={18} width={8} height={18} rx={2} fill={INK} />}
    {!tube && <Path d="M70 100 A30 30 0 0 1 130 100" stroke={ACC} strokeWidth={4} fill="none" strokeLinecap="round" />}
  </G>
);

const armrest = () => (
  <G>
    {[78, 128].map((y, i) => (
      <G key={y}>
        <Rect x={30} y={y - 16} width={140} height={32} rx={16} fill={i ? '#fff' : SOFT} stroke={INK} strokeWidth={sw} />
        <Path d={`M46 ${y} L154 ${y}`} stroke={i ? ACC : INK} strokeWidth={2} strokeDasharray="4 6" />
      </G>
    ))}
  </G>
);

const bag = () => (
  <G>
    <Path d="M40 70 L160 70 L152 160 Q150 168 142 168 L58 168 Q50 168 48 160 Z" fill={INK} />
    <Path d="M40 70 L160 70 L160 92 L40 92 Z" fill={ACC} />
    <Path d="M70 70 L70 44 Q70 36 78 36 L122 36 Q130 36 130 44 L130 70" stroke={INK} strokeWidth={sw} fill="none" />
    <Rect x={84} y={112} width={32} height={6} rx={3} fill="#fff" opacity={0.7} />
  </G>
);

const battery = () => (
  <G>
    <Rect x={36} y={60} width={128} height={100} rx={12} fill={INK} />
    <Rect x={56} y={48} width={22} height={14} rx={3} fill={GREY} />
    <Rect x={122} y={48} width={22} height={14} rx={3} fill={GREY} />
    <Path d="M104 80 L86 114 L100 114 L94 142 L116 104 L102 104 Z" fill={ACC} />
  </G>
);

const ART: Record<string, () => ReactNode> = {
  wheelchair: () => wheelchair('std'),
  'wheelchair-light': () => wheelchair('light'),
  'wheelchair-transport': () => wheelchair('transport'),
  'wheelchair-power': () => wheelchair('power'),
  walker: () => walker(false, false),
  rollator: () => walker(true, true),
  crutches,
  cane: () => cane(false),
  'cane-quad': () => cane(true),
  'shower-chair': () => chair('shower'),
  'transfer-bench': () => chair('bench'),
  commode: () => chair('commode'),
  'toilet-seat': toiletSeat,
  'grab-bar': grabBar,
  reacher,
  'sock-aid': sockAid,
  utensils,
  'pill-box': pillBox,
  'bed-rail': bedRail,
  cushion,
  gloves: () => glove(ACC),
  'push-gloves': () => glove(INK),
  briefs,
  stockings,
  'first-aid': firstAid,
  ramp: () => ramp(false),
  threshold: () => ramp(true),
  hinge,
  'stair-rail': stairRail,
  tyre: () => tyre(false),
  tube: () => tyre(true),
  armrest,
  bag,
  battery,
};

const VIEWS = ['', 'translate(-50 -40) scale(1.5)', 'translate(200 0) scale(-1 1)', 'translate(-110 -100) scale(2.1)'];

export const ProductArt = memo(function ProductArt({ art, seed = 0, size }: { art: string; seed?: number; size: number }) {
  const draw = ART[art] ?? ART.wheelchair;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G transform={VIEWS[seed % VIEWS.length]}>{draw()}</G>
    </Svg>
  );
});
