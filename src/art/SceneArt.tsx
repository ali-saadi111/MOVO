import { memo, type ReactNode } from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';
import type { ColorTokens } from '@/theme/colors';

/**
 * Flat drawn scenes (Navy and Mint on Mint Mist, one line weight) for places,
 * entrances, events and campaigns. They stand in for the team's photos in this
 * draft and are drawn at 4:3; 16:9 crops use `slice`.
 */
type P = { c: ColorTokens; seed: number };

const W = 400;
const H = 300;

const ground = ({ c }: P) => <Rect x={0} y={236} width={W} height={64} fill={c.illoSoft} />;
const sun = ({ c, seed }: P) => <Circle cx={seed % 2 ? 330 : 70} cy={64} r={26} fill={c.illoWarm} opacity={0.9} />;
const tree = (x: number, c: ColorTokens, s = 1) => (
  <G key={x}>
    <Rect x={x - 3 * s} y={196 * 1} width={6 * s} height={40} fill={c.illoInk} />
    <Circle cx={x} cy={186} r={24 * s} fill={c.illoAccent} />
    <Circle cx={x - 12 * s} cy={196} r={14 * s} fill={c.illoAccent} opacity={0.8} />
  </G>
);
const person = (x: number, c: ColorTokens, chair = true, flip = false) => (
  <G key={`p${x}`} transform={flip ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
    <Circle cx={x} cy={chair ? 190 : 170} r={9} fill={c.illoInk} />
    {chair ? (
      <G>
        <Path d={`M${x - 2} 200 L${x} 222 L${x + 18} 222 L${x + 22} 236`} stroke={c.illoInk} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={x - 2} cy={228} r={12} stroke={c.illoInk} strokeWidth={4} fill="none" />
        <Path d={`M${x - 12} 200 L${x - 10} 222`} stroke={c.illoAccent} strokeWidth={4} strokeLinecap="round" />
      </G>
    ) : (
      <Path d={`M${x} 180 L${x} 210 L${x - 6} 236 M${x} 210 L${x + 6} 236 M${x} 190 L${x + 10} 204`} stroke={c.illoInk} strokeWidth={6} fill="none" strokeLinecap="round" />
    )}
  </G>
);

function building({ c, seed }: P, sign: ReactNode, opts: { awning?: boolean; ramp?: boolean; color?: string; wide?: boolean } = {}) {
  const palette = [c.illoWarm, c.illoAccent, c.illoInk];
  const body = opts.color ?? palette[seed % 2 === 0 ? 0 : 0];
  const x = opts.wide ? 70 : 100;
  const w = opts.wide ? 260 : 200;
  const windowsInk = body === c.illoInk ? c.illoWarm : c.illoInk;
  return (
    <G>
      <Rect x={x} y={70} width={w} height={166} fill={body} />
      <Rect x={x} y={70} width={w} height={10} fill={c.illoInk} opacity={0.9} />
      {Array.from({ length: opts.wide ? 5 : 3 }, (_, k) => (
        <Rect key={k} x={x + 22 + k * ((w - 44) / (opts.wide ? 5 : 3))} y={94} width={(w - 44) / (opts.wide ? 5 : 3) - 14} height={34} rx={3} fill={windowsInk} opacity={0.16} />
      ))}
      {opts.awning !== false && (
        <G>
          {Array.from({ length: 8 }, (_, k) => (
            <Rect key={k} x={x + 10 + k * ((w - 20) / 8)} y={140} width={(w - 20) / 8} height={20} fill={k % 2 === (seed % 2) ? c.illoAccent : c.illoWarm} />
          ))}
          <Path d={`M${x + 10} 160 ${Array.from({ length: 8 }, (_, k) => `Q${x + 10 + (k + 0.5) * ((w - 20) / 8)} 170 ${x + 10 + (k + 1) * ((w - 20) / 8)} 160`).join(' ')}`} fill={c.illoAccent} />
        </G>
      )}
      <Rect x={x + w / 2 - 22} y={170} width={44} height={66} rx={3} fill={c.illoInk} />
      <Rect x={x + w / 2 - 18} y={174} width={17} height={58} fill={c.illoWarm} opacity={0.22} />
      <Rect x={x + 18} y={176} width={w / 2 - 50} height={44} rx={3} fill={windowsInk} opacity={0.16} />
      <Rect x={x + w / 2 + 32} y={176} width={w / 2 - 50} height={44} rx={3} fill={windowsInk} opacity={0.16} />
      {opts.ramp && <Path d={`M${x + w / 2 - 26} 236 L${x + w / 2 + 26} 236 L${x + w / 2 + 60} 244 L${x + w / 2 - 60} 244 Z`} fill={c.illoInk} opacity={0.8} />}
      <G transform={`translate(${x + w / 2 - 24} 104)`}>{sign}</G>
    </G>
  );
}

const glyph = {
  cup: (c: ColorTokens) => (
    <G>
      <Rect x={0} y={0} width={48} height={30} rx={15} fill={c.illoInk} />
      <Path d="M16 10 L30 10 L28 22 L18 22 Z M30 13 Q36 14 30 19" fill={c.illoWarm} stroke={c.illoWarm} strokeWidth={1.5} />
    </G>
  ),
  fork: (c: ColorTokens) => (
    <G>
      <Rect x={0} y={0} width={48} height={30} rx={15} fill={c.illoInk} />
      <Path d="M18 7 L18 23 M15 7 L15 13 Q18 16 21 13 L21 7 M30 7 Q34 12 30 17 L30 23" stroke={c.illoWarm} strokeWidth={2} fill="none" strokeLinecap="round" />
    </G>
  ),
  cross: (c: ColorTokens) => (
    <G>
      <Rect x={0} y={0} width={48} height={30} rx={15} fill={c.illoInk} />
      <Path d="M24 6 L24 24 M15 15 L33 15" stroke={c.illoAccent} strokeWidth={5} strokeLinecap="round" />
    </G>
  ),
  steth: (c: ColorTokens) => (
    <G>
      <Rect x={0} y={0} width={48} height={30} rx={15} fill={c.illoInk} />
      <Path d="M18 7 Q18 19 24 19 Q30 19 30 7 M24 19 L24 22 Q24 26 30 26" stroke={c.illoWarm} strokeWidth={2} fill="none" />
      <Circle cx={31} cy={25} r={2.4} fill={c.illoAccent} />
    </G>
  ),
  bank: (c: ColorTokens) => (
    <G>
      <Rect x={0} y={0} width={48} height={30} rx={15} fill={c.illoInk} />
      <Path d="M14 12 L24 6 L34 12 Z M16 14 L16 22 M21 14 L21 22 M27 14 L27 22 M32 14 L32 22 M13 24 L35 24" stroke={c.illoWarm} strokeWidth={2} fill={c.illoWarm} strokeLinejoin="round" />
    </G>
  ),
  bag: (c: ColorTokens) => (
    <G>
      <Rect x={0} y={0} width={48} height={30} rx={15} fill={c.illoInk} />
      <Path d="M16 11 L32 11 L31 24 L17 24 Z M20 11 Q20 5 24 5 Q28 5 28 11" stroke={c.illoWarm} strokeWidth={2} fill="none" strokeLinejoin="round" />
    </G>
  ),
  cart: (c: ColorTokens) => (
    <G>
      <Rect x={0} y={0} width={48} height={30} rx={15} fill={c.illoInk} />
      <Path d="M13 8 L17 8 L20 20 L32 20 L34 12 L18 12" stroke={c.illoWarm} strokeWidth={2} fill="none" strokeLinejoin="round" />
      <Circle cx={21} cy={24} r={2} fill={c.illoAccent} />
      <Circle cx={30} cy={24} r={2} fill={c.illoAccent} />
    </G>
  ),
};

function sea({ c }: P) {
  return (
    <G>
      <Rect x={0} y={150} width={W} height={90} fill={c.illoAccent} opacity={0.35} />
      {Array.from({ length: 6 }, (_, k) => <Path key={k} d={`M${20 + k * 66} ${176 + (k % 2) * 18} q12 -8 24 0 t24 0`} stroke={c.illoWarm} strokeWidth={3} fill="none" strokeLinecap="round" />)}
    </G>
  );
}

function entrance({ c, seed }: P, level: 'accessible' | 'partly' | 'not') {
  const steps = level === 'not' ? 3 : level === 'partly' ? 1 : 0;
  const zoom = seed % 3;
  return (
    <G transform={zoom === 1 ? 'translate(-60 -40) scale(1.3)' : zoom === 2 ? 'translate(400 0) scale(-1 1)' : undefined}>
      <Rect x={0} y={0} width={W} height={H} fill={c.illoBg} />
      <Rect x={60} y={20} width={280} height={230} fill={c.illoWarm} />
      <Rect x={150} y={60} width={100} height={190 - steps * 14} fill={c.illoInk} />
      <Rect x={156} y={66} width={42} height={178 - steps * 14} fill={c.illoAccent} opacity={0.35} />
      <Rect x={202} y={66} width={42} height={178 - steps * 14} fill={c.illoAccent} opacity={0.2} />
      {Array.from({ length: steps }, (_, k) => (
        <Rect key={k} x={130 - k * 16} y={250 - (steps - k) * 14} width={140 + k * 32} height={14} fill={c.illoInk} opacity={0.55 + k * 0.12} />
      ))}
      <Rect x={0} y={250} width={W} height={50} fill={c.illoSoft} />
      {level === 'accessible' && <Path d="M150 250 L250 250 L320 262 L80 262 Z" fill={c.illoInk} opacity={0.7} />}
      {level === 'partly' && <Path d="M250 250 L330 262 L250 262 Z" fill={c.illoAccent} />}
      {level === 'accessible' && (
        <G transform="translate(272 70)">
          <Rect width={44} height={44} rx={10} fill={c.illoInk} />
          <Circle cx={20} cy={11} r={4} fill={c.illoWarm} />
          <Path d="M19 17 L19 27 L29 27 L32 35 M14 21 Q10 34 22 35" stroke={c.illoWarm} strokeWidth={3} fill="none" strokeLinecap="round" />
        </G>
      )}
      <Line x1={150} y1={150} x2={150} y2={250} stroke={c.illoInk} strokeWidth={2} />
    </G>
  );
}

function court({ c }: P) {
  return (
    <G>
      <Rect x={0} y={0} width={W} height={H} fill={c.illoBg} />
      <Rect x={0} y={180} width={W} height={120} fill={c.illoAccent} opacity={0.4} />
      <Path d="M40 300 L120 180 M360 300 L280 180 M120 180 L280 180" stroke={c.illoWarm} strokeWidth={4} />
      <Path d="M140 230 Q200 260 260 230" stroke={c.illoWarm} strokeWidth={4} fill="none" />
      <Rect x={186} y={60} width={6} height={120} fill={c.illoInk} />
      <Rect x={160} y={50} width={60} height={40} rx={4} fill={c.illoWarm} stroke={c.illoInk} strokeWidth={4} />
      <Path d="M178 92 L182 112 L198 112 L202 92" stroke={c.illoInk} strokeWidth={3} fill="none" />
      <Circle cx={248} cy={120} r={16} fill={c.illoInk} />
      <Path d="M234 116 Q248 110 262 116 M248 104 L248 136" stroke={c.illoAccent} strokeWidth={2} fill="none" />
      {person(110, c)}
      {person(300, c, true, true)}
    </G>
  );
}

function workshop({ c, seed }: P) {
  return (
    <G>
      <Rect x={0} y={0} width={W} height={H} fill={c.illoBg} />
      <Rect x={40} y={36} width={120} height={80} rx={6} fill={c.illoWarm} />
      <Path d="M56 100 L84 70 L104 88 L124 60 L146 100 Z" fill={c.illoAccent} />
      <Rect x={50} y={190} width={300} height={14} rx={4} fill={c.illoInk} />
      <Path d="M70 204 L70 260 M330 204 L330 260" stroke={c.illoInk} strokeWidth={8} />
      {[110, 190, 270].map((x, k) => (
        <Path key={x} d={`M${x - 20} 190 Q${x - 26} ${150 - k * 6} ${x - 10} ${140 - k * 4} L${x + 10} ${140 - k * 4} Q${x + 26} ${150 - k * 6} ${x + 20} 190 Z`} fill={k === seed % 3 ? c.illoAccent : c.illoWarm} stroke={c.illoInk} strokeWidth={3} />
      ))}
      <Rect x={0} y={260} width={W} height={40} fill={c.illoSoft} />
    </G>
  );
}

function meetup({ c }: P) {
  return (
    <G>
      <Rect x={0} y={0} width={W} height={H} fill={c.illoBg} />
      {sun({ c, seed: 1 })}
      <Rect x={0} y={236} width={W} height={64} fill={c.illoSoft} />
      <Path d="M130 180 L270 180" stroke={c.illoInk} strokeWidth={8} strokeLinecap="round" />
      <Path d="M200 180 L200 236 M176 236 L224 236" stroke={c.illoInk} strokeWidth={6} strokeLinecap="round" />
      <Rect x={160} y={160} width={18} height={20} rx={3} fill={c.illoWarm} stroke={c.illoInk} strokeWidth={3} />
      <Rect x={222} y={160} width={18} height={20} rx={3} fill={c.illoAccent} stroke={c.illoInk} strokeWidth={3} />
      {person(100, c)}
      {person(300, c, false)}
      {tree(40, c, 0.8)}
      {tree(370, c, 0.9)}
    </G>
  );
}

function chairsRow({ c }: P) {
  return (
    <G>
      <Rect x={0} y={0} width={W} height={H} fill={c.illoBg} />
      <Rect x={0} y={236} width={W} height={64} fill={c.illoSoft} />
      {[70, 160, 250, 340].map((x, k) => (
        <G key={x} opacity={k === 1 ? 1 : 0.9}>
          <Path d={`M${x - 20} 150 L${x - 16} 206 L${x + 20} 206 L${x + 30} 236`} stroke={c.illoInk} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={x - 12} cy={214} r={22} stroke={c.illoInk} strokeWidth={5} fill="none" />
          <Path d={`M${x - 18} 160 L${x + 14} 160 L${x + 18} 196`} stroke={k === 1 ? c.illoAccent : c.illoInk} strokeWidth={5} fill="none" strokeLinecap="round" />
        </G>
      ))}
      <Path d="M182 70 C182 50 212 50 212 70 C212 50 242 50 242 70 C242 92 212 106 212 112 C212 106 182 92 182 70 Z" fill={c.illoAccent} />
    </G>
  );
}

function repair({ c }: P) {
  return (
    <G>
      <Rect x={0} y={0} width={W} height={H} fill={c.illoBg} />
      <Circle cx={200} cy={150} r={86} stroke={c.illoInk} strokeWidth={14} fill="none" />
      {Array.from({ length: 10 }, (_, k) => { const a = (k / 10) * Math.PI * 2; return <Line key={k} x1={200} y1={150} x2={200 + Math.cos(a) * 76} y2={150 + Math.sin(a) * 76} stroke={c.illoInk} strokeWidth={2} opacity={0.5} />; })}
      <Circle cx={200} cy={150} r={10} fill={c.illoInk} />
      <Path d="M250 220 L320 150 M312 130 Q336 122 344 146 L330 150 L326 162 L338 168 Q322 186 304 168" stroke={c.illoAccent} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
}

function physio({ c }: P) {
  return (
    <G>
      <Rect x={0} y={0} width={W} height={H} fill={c.illoBg} />
      <Rect x={0} y={236} width={W} height={64} fill={c.illoSoft} />
      <Rect x={60} y={222} width={220} height={14} rx={7} fill={c.illoAccent} />
      <Circle cx={310} cy={196} r={40} fill={c.illoInk} />
      <Path d="M276 180 Q310 200 344 180" stroke={c.illoAccent} strokeWidth={3} fill="none" />
      {person(130, c, false)}
      <Circle cx={190} cy={204} r={9} fill={c.illoInk} />
      <Path d="M190 214 L230 222 M200 216 L178 222" stroke={c.illoInk} strokeWidth={6} strokeLinecap="round" />
    </G>
  );
}

function outdoor(p: P) {
  const { c } = p;
  return (
    <G>
      <Rect x={0} y={0} width={W} height={H} fill={c.illoBg} />
      {sun(p)}
      {sea(p)}
      <Rect x={0} y={232} width={W} height={68} fill={c.illoSoft} />
      <Path d="M0 232 L400 232" stroke={c.illoInk} strokeWidth={4} />
      {Array.from({ length: 9 }, (_, k) => <Path key={k} d={`M${20 + k * 46} 232 L${20 + k * 46} 210`} stroke={c.illoInk} strokeWidth={3} />)}
      <Path d="M0 212 L400 212" stroke={c.illoInk} strokeWidth={3} />
      {person(250, c)}
      {tree(70, c)}
    </G>
  );
}

function placeScene(p: P, cat: string) {
  const { c, seed } = p;
  const ramp = seed % 3 !== 2;
  const color = [c.illoWarm, c.illoWarm, c.illoAccent][seed % 3];
  const signs: Record<string, ReactNode> = {
    cafe: glyph.cup(c), restaurant: glyph.fork(c), pharmacy: glyph.cross(c), clinic: glyph.steth(c), bank: glyph.bank(c), shop: glyph.bag(c), supermarket: glyph.cart(c),
  };
  return (
    <G>
      <Rect x={0} y={0} width={W} height={H} fill={c.illoBg} />
      {sun(p)}
      {ground(p)}
      {building(p, signs[cat] ?? glyph.bag(c), { awning: cat === 'cafe' || cat === 'restaurant' || cat === 'shop' || cat === 'supermarket', ramp, color: cat === 'bank' || cat === 'clinic' ? c.illoWarm : color, wide: cat === 'supermarket' || cat === 'clinic' })}
      {cat !== 'supermarket' && cat !== 'clinic' && tree(seed % 2 ? 50 : 350, c, 0.9)}
      {seed % 2 === 0 && person(seed % 4 === 0 ? 330 : 64, c, true, seed % 4 === 0)}
    </G>
  );
}

export const SceneArt = memo(function SceneArt({ art, seed = 0, width, height }: { art: string; seed?: number; width: number; height: number }) {
  const { colors } = useTheme();
  const p: P = { c: colors, seed };
  let body: ReactNode;
  if (art.startsWith('entrance-')) body = entrance(p, art.slice(9) as 'accessible');
  else if (art === 'event-sports') body = court(p);
  else if (art === 'event-workshop') body = workshop(p);
  else if (art === 'event-meetup') body = meetup(p);
  else if (art === 'campaign-chairs') body = chairsRow(p);
  else if (art === 'campaign-ramps') body = placeScene({ c: colors, seed: 0 }, 'shop');
  else if (art === 'campaign-physio') body = physio(p);
  else if (art === 'campaign-repair') body = repair(p);
  else if (art === 'outdoor') body = outdoor(p);
  else body = placeScene(p, art);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      {body}
    </Svg>
  );
});
