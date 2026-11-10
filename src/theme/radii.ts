/** Corner radii. Always pair with borderCurve: 'continuous'. */
export const radii = {
  iconTile: 7,
  cell: 16,
  input: 16,
  thumb: 16,
  card: 24,
  tile: 22,
  hero: 32,
  capsule: 999,
} as const;

export const continuous = { borderCurve: 'continuous' as const };
