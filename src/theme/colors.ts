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
  textPrimary: brand.navy,
  textSecondary: '#5E6E75',
  textTertiary: '#7C8B91',
  textOnBrand: '#FFFFFF',
  tint: brand.navy,
  accent: brand.mint,
  accentText: '#0E7A58', // derived
  buttonPrimaryBg: brand.navy,
  buttonPrimaryFg: '#FFFFFF',
  buttonSecondaryBg: brand.mintMist,
  buttonSecondaryFg: brand.navy,
  separator: 'rgba(1,52,71,0.12)',
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

export const dark: ColorTokens = {
  bgPrimary: '#000000',
  bgGrouped: '#000000',
  bgElevated: '#1C1C1E',
  bgElevated2: '#2C2C2E',
  bgBrand: '#0A2A36',
  bgSelected: 'rgba(34,211,156,0.16)',
  fill: 'rgba(255,255,255,0.10)',
  fillStrong: 'rgba(255,255,255,0.16)',
  textPrimary: '#FFFFFF',
  textSecondary: '#8A9BA2',
  textTertiary: '#6B7B81',
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
  blockNavy: '#0B3A4C',
  blockNavyInk: '#FFFFFF',
  tabBar: '#1C2B31',
  tabBarIcon: 'rgba(255,255,255,0.7)',
  tabBarActive: brand.mint,
  tabBarActiveIcon: brand.navy,
  canvas: '#000000',
};

/** Pins use the light-mode rating colours in both modes (prompt §4 Map notes). */
export const pinColors = {
  accessible: brand.mint,
  partly: brand.amber,
  not: brand.red,
  accessibleGlyph: brand.navy,
  onColorGlyph: '#FFFFFF',
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
