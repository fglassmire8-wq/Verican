/** Photos-style review grid: denser columns as the list grows, tiles capped on desktop. */
export const REVIEW_TILE_MAX_PX = 180;
export const REVIEW_TILE_GAP_PX = 3;

export function reviewGridExtraColumns(count: number): number {
  if (count > 30) return 2;
  if (count > 12) return 1;
  return 0;
}

export function reviewGridColumnCounts(count: number): {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
} {
  const extra = reviewGridExtraColumns(count);
  return {
    mobile: 3 + extra,
    tablet: 5 + extra,
    desktop: 6 + extra,
    wide: 8 + extra,
  };
}
