/**
 * Movo semantic colour tokens. Components read tokens only; raw hex lives here.
 * Brand values come from the Movo brand sheet. Values marked "derived" are not in
 * the sheet and need owner sign-off (see README › Open questions).
 */
export const brand = {
  navy: '#013447',
  mint: '#22D39C',
  mintMist: '#E3F8F0',
  white: '#FFFFFF',
  amber: '#B45309',
  red: '#C53030',
} as const;

export type ColorTokens = {
  bgPrimary: string;
  bgGrouped: string;
  bgElevated: string;
  bgElevated2: string;
  bgBrand: string;
  bgSelected: string;
  fill: string;
  fillStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnBrand: string;
  tint: string;
  accent: string;
  accentText: string;
  buttonPrimaryBg: string;
  buttonPrimaryFg: string;
  buttonSecondaryBg: string;
  buttonSecondaryFg: string;
  separator: string;
  ratingAccessible: string;
  ratingAccessibleGlyph: string;
  ratingPartly: string;
  ratingNot: string;
  ratingGlyphOnColor: string;
  danger: string;
  shadow: string;
  scrim: string;
  productOverlay: string;
  mapLand: string;
  mapWater: string;
  mapRoad: string;
  mapRoadMajor: string;
  mapPark: string;
  mapBuilding: string;
  illoBg: string;
  illoInk: string;
  illoAccent: string;
  illoSoft: string;
  illoWarm: string;
  /** Colour blocks for hero cards and stat tiles (derived tints of the brand palette). */
  blockMint: string;
  blockMintInk: string;
  blockMist: string;
  blockMistInk: string;
  blockSand: string;
  blockSandInk: string;
  blockNavy: string;
  blockNavyInk: string;
  tabBar: string;
  tabBarIcon: string;
  tabBarActive: string;
  tabBarActiveIcon: string;
  canvas: string;
};

export const light: ColorTokens = {
  bgPrimary: '#FFFFFF',
  bgGrouped: '#F2F4F5',
  bgElevated: '#FFFFFF',
  bgElevated2: '#FFFFFF',
  bgBrand: brand.navy,
  bgSelected: brand.mintMist,
  fill: 'rgba(1,52,71,0.06)',
  fillStrong: 'rgba(1,52,71,0.10)',
  textPrimary: '#15191B', // near-black, like the Toters reference; navy stays on buttons
  textSecondary: '#686F73',
  textTertiary: '#868D91',
  textOnBrand: '#FFFFFF',
  tint: brand.navy,
  accent: brand.mint,
  accentText: '#0E7A58', // derived
  buttonPrimaryBg: brand.navy,
  buttonPrimaryFg: '#FFFFFF',
  buttonSecondaryBg: brand.mintMist,
  buttonSecondaryFg: brand.navy,
  separator: 'rgba(0,0,0,0.08)',
  ratingAccessible: brand.mint,
  ratingAccessibleGlyph: brand.navy,
  ratingPartly: brand.amber,
  ratingNot: brand.red,
  ratingGlyphOnColor: '#FFFFFF',
  danger: brand.red,
  shadow: 'rgba(1,52,71,0.08)',
  scrim: 'rgba(1,20,28,0.36)',
  productOverlay: 'rgba(1,52,71,0.04)',
  mapLand: '#F4F2EC',
  mapWater: '#BFE3EE',
  mapRoad: '#FFFFFF',
  mapRoadMajor: '#FFF4D6',
  mapPark: '#D7EFD9',
  mapBuilding: '#E9E6DE',
  illoBg: brand.mintMist,
  illoInk: brand.navy,
  illoAccent: brand.mint,
  illoSoft: '#C6EEDF',
  illoWarm: '#FFFFFF',
  blockMint: brand.mint,
  blockMintInk: brand.navy,
  blockMist: brand.mintMist,
  blockMistInk: brand.navy,
  blockSand: '#FCE9D2', // derived: brand amber tint
  blockSandInk: '#6B3305', // derived
  blockNavy: brand.navy,
  blockNavyInk: '#FFFFFF',
  tabBar: brand.navy,
  tabBarIcon: 'rgba(255,255,255,0.72)',
  tabBarActive: brand.mint,
  tabBarActiveIcon: brand.navy,
  canvas: '#FFFFFF', // white, like the reference; tiles carry hairline borders
};

/** Dark mode sits on the launch screen's navy (#043345) instead of black; surfaces step up from it. */
export const dark: ColorTokens = {
  bgPrimary: '#043345',
  bgGrouped: '#043345',
  bgElevated: '#0B4257',
  bgElevated2: '#15526A',
  bgBrand: '#022733',
  bgSelected: 'rgba(34,211,156,0.16)',
  fill: 'rgba(255,255,255,0.10)',
  fillStrong: 'rgba(255,255,255,0.16)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A6B8BF',
  textTertiary: '#8399A2',
  textOnBrand: '#FFFFFF',
  tint: brand.mint,
  accent: brand.mint,
  accentText: brand.mint,
  buttonPrimaryBg: brand.mint,
  buttonPrimaryFg: brand.navy,
  buttonSecondaryBg: 'rgba(34,211,156,0.16)',
  buttonSecondaryFg: brand.mint,
  separator: 'rgba(255,255,255,0.15)',
  ratingAccessible: brand.mint,
  ratingAccessibleGlyph: brand.navy,
  ratingPartly: '#E8A33D', // derived
  ratingNot: '#F87171', // derived
  ratingGlyphOnColor: '#0B1215',
  danger: '#F87171',
  shadow: 'transparent',
  scrim: 'rgba(0,0,0,0.5)',
  productOverlay: 'rgba(255,255,255,0.0)',
  mapLand: '#1D2326',
  mapWater: '#0E2C38',
  mapRoad: '#2D3539',
  mapRoadMajor: '#3B4549',
  mapPark: '#1C2E25',
  mapBuilding: '#252C30',
  illoBg: '#0F2A33',
  illoInk: '#E3F8F0',
  illoAccent: brand.mint,
  illoSoft: '#1D4A44',
  illoWarm: '#173640',
  blockMint: brand.mint,
  blockMintInk: brand.navy,
  blockMist: '#0F2E2A',
  blockMistInk: '#E3F8F0',
  blockSand: '#3A2816',
  blockSandInk: '#F9D9B0',
  blockNavy: '#0E4A61',
  blockNavyInk: '#FFFFFF',
  tabBar: '#0B4257',
  tabBarIcon: 'rgba(255,255,255,0.7)',
  tabBarActive: brand.mint,
  tabBarActiveIcon: brand.navy,
  canvas: '#043345',
};

/**
 * The navy card shared by Care's cards and Shop's product cards, after Shop's "Not sure what
 * fits?" banner. Same in light and dark: navy ground, thin mint outline, white type, mint accents.
 */
export const navyCard = { bg: '#0A3F52', line: 'rgba(60,242,184,0.16)', text: '#FFFFFF', soft: 'rgba(255,255,255,0.82)', dim: 'rgba(255,255,255,0.62)', mint: '#3CF2B8', warn: '#FFC46B', ink: '#013447' } as const;

/**
 * Pins are the mood artwork in assets/moods, the same in both modes: happy green (accessible),
 * neutral yellow (partly) and sad red (not). These are that artwork's base colours.
 */
export const pinColors = {
  accessible: '#15C99C',
  partly: '#F7C531',
  not: '#EF5350',
  ring: '#FFFFFF',
  cluster: brand.navy,
} as const;

export function withHighContrast(c: ColorTokens, scheme: 'light' | 'dark'): ColorTokens {
  return {
    ...c,
    textSecondary: c.textPrimary,
    textTertiary: c.textPrimary,
    separator: scheme === 'light' ? 'rgba(1,52,71,0.35)' : 'rgba(255,255,255,0.35)',
  };
}


/**
 * Content palette (the colour pass). Soft tints for tiles and pictures, each with an ink of
 * the same hue for the drawing on it. Brand navy/mint stay for buttons and the tab bar; the
 * map never uses these, so the accessibility rating colours stay unambiguous. In dark mode
 * the warm tints sit on deep navy instead of brown.
 */
export type TintName = 'sky' | 'peach' | 'lilac' | 'butter' | 'rose' | 'mint';
export type Tint = { bg: string; ink: string; /** light pastel used behind photos and avatars, both modes */ soft: string };
export type Tints = Record<TintName, Tint>;

export const lightTints: Tints = {
  sky: { bg: '#DDEBFF', ink: '#1E4FB8', soft: '#DDEBFF' },
  peach: { bg: '#FFE6D5', ink: '#A3401B', soft: '#FFE6D5' },
  lilac: { bg: '#ECE5FF', ink: '#5534C0', soft: '#ECE5FF' },
  butter: { bg: '#FFF0BF', ink: '#7A5200', soft: '#FFF0BF' },
  rose: { bg: '#FFE1EB', ink: '#A3204E', soft: '#FFE1EB' },
  mint: { bg: '#DDF7EC', ink: '#0E7A58', soft: '#DDF7EC' },
};

export const darkTints: Tints = {
  sky: { bg: '#14254A', ink: '#9CC2FF', soft: '#BFD5F7' },
  peach: { bg: '#0F2C3B', ink: '#FFB48A', soft: '#F6CDB2' },
  lilac: { bg: '#261C4A', ink: '#C3B1FF', soft: '#D3C7F7' },
  butter: { bg: '#132A44', ink: '#FFD666', soft: '#F3DC92' },
  rose: { bg: '#3A1424', ink: '#FF9DBE', soft: '#F4C3D3' },
  mint: { bg: '#0D2D24', ink: '#5BE3B5', soft: '#B9EBD6' },
};

/** The one mint part every Movo drawing carries, and the highlight on it. */
export const drawingAccent = brand.mint;
