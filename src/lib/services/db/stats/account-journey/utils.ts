import { format } from 'date-fns';
import {
  DIFFICULTY_UNKNOWN_BUCKET,
  RATING_BANDS,
} from './constants';
import type {
  CurriculumRow,
  RatingBandDefinition,
  RatingHistoryRow,
} from './types';

export function formatEpochDate(epochSecond: number) {
  return format(new Date(epochSecond * 1000), 'yyyy-MM-dd');
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

export function resolveRatingAtEpoch(
  epochSecond: number,
  ratingHistory: RatingHistoryRow[]
) {
  if (ratingHistory.length === 0) return 0;

  return ratingHistory.reduce((rating, row) => {
    const endEpoch = Math.floor(row.endTime.getTime() / 1000);
    return endEpoch <= epochSecond ? row.newRating : rating;
  }, ratingHistory[0].oldRating);
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
