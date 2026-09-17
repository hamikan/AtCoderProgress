export interface RatingData {
  date: string;
  rating: number;
  contestName: string;
}

export interface RatingSummary {
  currentRating: number;
  currentRatingChange: number;
  highestRating: number;
}
