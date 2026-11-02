export interface RatingData {
  /** コンテストの終了時刻（エポックミリ秒） */
  endedAt: number;
  rating: number;
  contestName: string;
  performance: number;
}

export interface RatingSummary {
  currentRating: number;
  currentRatingChange: number;
  highestRating: number;
}

export interface NextRatingBand {
  /** Lower bound of the next rating band. */
  threshold: number;
  /** Japanese color name of the next rating band. */
  colorName: string;
  /** Points needed to reach the next band. */
  pointsNeeded: number;
}
