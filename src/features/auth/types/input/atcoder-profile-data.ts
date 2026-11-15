import type { RatingHistoryResource } from '@/lib/atcoder/ratings/types';

export interface AtCoderFullFetchResult {
  ratingHistory: RatingHistoryResource[];
  /** AtCoder 側の大文字小文字の表記。提出が1件もないときは分からないので null */
  canonicalName: string | null;
}
