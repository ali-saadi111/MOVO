import Svg, { Circle, Path } from 'react-native-svg';

export type TabGlyph = 'home' | 'map' | 'shop' | 'care' | 'community' | 'profile' | 'fold' | 'list';

/**
 * Movo's own tab icons: rounded 1.9 px outlines at rest; when selected the shape
 * fills mint with a navy outline, the brand's two colours.
 */
export function TabIcon({ name, on, ink, fill, size = 25 }: { name: TabGlyph; on: boolean; ink: string; fill: string; size?: number }) {
  const sw = 1.9;
  const body = { stroke: ink, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: on ? fill : 'none' };
  const line = { stroke: ink, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {name === 'home' ? (
        <>
          <Path d="M3.8 10.4 12 3.8l8.2 6.6v8.4a1.7 1.7 0 0 1-1.7 1.7h-3.8v-5.6a1.2 1.2 0 0 0-1.2-1.2h-3a1.2 1.2 0 0 0-1.2 1.2v5.6H5.5a1.7 1.7 0 0 1-1.7-1.7z" {...body} />
        </>
      ) : name === 'map' ? (
        <>
          <Path d="M12 21.2s-6.6-5.5-6.6-11.1a6.6 6.6 0 0 1 13.2 0c0 5.6-6.6 11.1-6.6 11.1z" {...body} />
          <Circle cx={12} cy={10.1} r={2.4} {...line} fill={on ? '#FFFFFF' : 'none'} />
        </>
      ) : name === 'fold' ? (
        <>
          <Path d="M3.6 6.4 8.8 4.2l6.4 2.4 5.2-2.2v13.4l-5.2 2.2-6.4-2.4-5.2 2.2z" {...body} />
          <Path d="M8.8 4.2v13.4M15.2 6.6V20" {...line} />
          <Circle cx={15.2} cy={10.4} r={1.6} {...line} fill={on ? '#FFFFFF' : 'none'} />
        </>
      ) : name === 'list' ? (
        <>
          <Path d="M9 7h11M9 12h11M9 17h11" {...line} />
          <Circle cx={4.8} cy={7} r={1.3} {...line} fill={ink} />
          <Circle cx={4.8} cy={12} r={1.3} {...line} fill={ink} />
          <Circle cx={4.8} cy={17} r={1.3} {...line} fill={ink} />
        </>
      ) : name === 'shop' ? (
        <>
          <Path d="M4.6 8.2h14.8l-1.1 11a1.8 1.8 0 0 1-1.8 1.6H7.5a1.8 1.8 0 0 1-1.8-1.6z" {...body} />
          <Path d="M8.8 10.8V6.9a3.2 3.2 0 0 1 6.4 0v3.9" {...line} />
        </>
      ) : name === 'care' ? (
        <>
          <Path d="M12 20.3s-8-4.7-8-10.6a4.4 4.4 0 0 1 8-2.6 4.4 4.4 0 0 1 8 2.6c0 5.9-8 10.6-8 10.6z" {...body} />
          <Path d="M12 9.6v5.2M9.4 12.2h5.2" {...line} />
        </>
      ) : name === 'community' ? (
        <>
          <Circle cx={9} cy={8.2} r={3.2} {...body} />
          <Path d="M3.2 19.6a5.8 5.8 0 0 1 11.6 0z" {...body} />
          <Circle cx={16.8} cy={9.4} r={2.5} {...body} />
          <Path d="M15.6 14.4a4.6 4.6 0 0 1 5.2 5.2h-3.4" {...line} />
        </>
      ) : (
        <>
          <Circle cx={12} cy={8.4} r={3.7} {...body} />
          <Path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0z" {...body} />
        </>
      )}
    </Svg>
  );
}
