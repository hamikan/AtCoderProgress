import type { NextRatingBand } from '@/features/ratings/types';

const RATING_BANDS: ReadonlyArray<{ threshold: number; colorName: string }> = [
  { threshold: 400, colorName: '茶' },
  { threshold: 800, colorName: '緑' },
  { threshold: 1200, colorName: '水色' },
  { threshold: 1600, colorName: '青' },
  { threshold: 2000, colorName: '黄' },
  { threshold: 2400, colorName: '橙' },
  { threshold: 2800, colorName: '赤' },
];

/**
 * Returns the next rating band above the given rating,
 * or null when the rating is already in the top band (2800+).
 */
export function getNextRatingBand(rating: number): NextRatingBand | null {
  for (const band of RATING_BANDS) {
    if (rating < band.threshold) {
      return {
        threshold: band.threshold,
        colorName: band.colorName,
        pointsNeeded: band.threshold - rating,
      };
    }
  }
  return null;
}
