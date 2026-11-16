import { formatTokyoDate } from '@/lib/date/tokyo-date';
import {
  DIFFICULTY_UNKNOWN_BUCKET,
  RATING_BANDS,
} from './constants';
import type {
  RatingBandDefinition,
} from '@/features/ratings/types/output/account-journey';
import type {
  CurriculumRow,
  RatingHistoryRow,
} from '@/features/ratings/types/input/account-journey-rows';

export function formatEpochDate(epochSecond: number) {
  return formatTokyoDate(new Date(epochSecond * 1000));
}

export function toPercentage(solved: number, total: number) {
  return total > 0 ? Math.round((solved / total) * 100) : 0;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function buildProblemUrl(contestId: string, problemId: string) {
  return `https://atcoder.jp/contests/${contestId}/tasks/${problemId}`;
}

export function getRatingBand(rating: number): RatingBandDefinition {
  return (
    RATING_BANDS.find((band) => {
      if (band.max === null) return rating >= band.min;
      return rating >= band.min && rating <= band.max;
    }) ?? RATING_BANDS[0]
  );
}

export function getDifficultyBucket(difficulty: number | null) {
  if (difficulty === null) return DIFFICULTY_UNKNOWN_BUCKET;
  return getRatingBand(difficulty);
}

// 提出のたびに履歴を全件たどると提出数×コンテスト数になるので、終了時刻の昇順で渡される前提で二分探索する
export function resolveRatingAtEpoch(
  epochSecond: number,
  ratingHistory: RatingHistoryRow[]
) {
  if (ratingHistory.length === 0) return 0;

  let low = 0;
  let high = ratingHistory.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const endEpoch = Math.floor(ratingHistory[middle].endTime.getTime() / 1000);

    if (endEpoch <= epochSecond) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  return low === 0 ? ratingHistory[0].oldRating : ratingHistory[low - 1].newRating;
}

// reduce のたびに Map や Set を複製すると件数の二乗になるので、集計中だけ関数内の Map を書き換える
export function getOrCreate<Key, Value>(
  map: Map<Key, Value>,
  key: Key,
  create: () => Value
) {
  const existing = map.get(key);
  if (existing !== undefined) return existing;

  const created = create();
  map.set(key, created);
  return created;
}

export function compareCurriculumRows(a: CurriculumRow, b: CurriculumRow) {
  const contestComparison = a.contestId.localeCompare(b.contestId);
  if (contestComparison !== 0) return contestComparison;

  return a.problemIndex.localeCompare(b.problemIndex, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

export function classifyJoiContest(contestId: string): 'yo' | 'ho' | 'sc' | 'other' {
  if (contestId.startsWith('joisc') || contestId.includes('spring')) return 'sc';
  if (contestId.includes('ho')) return 'ho';
  if (contestId.includes('yo')) return 'yo';
  return 'other';
}
