/** 4 pt grid. Use these, never literal numbers, in components. */
export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 } as const;

export const layout = {
  margin: 16,
  marginWide: 20,
  sectionGap: 32,
  headerToContent: 12,
  siblingGap: 12,
  cardPadding: 16,
  titleToMeta: 8,
  metaGap: 4,
  rowMin: 48,
  rowWithSubtitle: 64,
  target: 48,
  barTarget: 44,
  tileIcon: 30,
  stickyCTAHeight: 52,
  gridGutter: 12,
} as const;
