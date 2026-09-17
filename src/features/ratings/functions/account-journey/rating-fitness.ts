import { RATING_BANDS } from './constants';
import { clamp, getRatingBand } from './utils';
import type { RatingHistoryRow } from '@/features/ratings/types/input/account-journey-rows';
import type { RatingFitness } from '@/features/ratings/types/output/account-journey';

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_PERFORMANCE_SCALE = 30;
const FITNESS_RATING_HISTORY_LIMIT = 10;
const PERFORMANCE_DECAY_DAYS = 120;

export function buildRatingFitness(
  ratingHistory: RatingHistoryRow[]
): RatingFitness {
  const currentRating = ratingHistory.at(-1)?.newRating ?? 0;
  const highestRating = ratingHistory.reduce(
    (highest, row) => Math.max(highest, row.newRating),
    currentRating
  );
  const fitnessRows = ratingHistory.slice(-FITNESS_RATING_HISTORY_LIMIT);
  const performanceStats = summarizeWeightedRatingHistory(
    fitnessRows,
    (row) => row.performance
  );
  const growthStats = summarizeWeightedRatingHistory(
    ratingHistory,
    (row) => row.performance - row.oldRating
  );
  const performanceScale =
    performanceStats.average === null
      ? null
      : Math.max(performanceStats.stdDev ?? 0, MIN_PERFORMANCE_SCALE);
  const performanceZScore =
    performanceStats.average === null || performanceScale === null
      ? null
      : (performanceStats.average - currentRating) / performanceScale;
  const absolutePerformanceZScore =
    performanceZScore === null ? null : Math.abs(performanceZScore);
  const fitnessScore =
    performanceZScore === null
      ? null
      : clamp(roundToFirstDecimal(50 + 10 * performanceZScore), 20, 80);
  const growthScale =
    growthStats.average === null
      ? null
      : Math.max(growthStats.stdDev ?? 0, MIN_PERFORMANCE_SCALE);
  const growthZScore =
    growthStats.average === null || growthScale === null
      ? null
      : growthStats.average / growthScale;
  const growthScore =
    growthZScore === null
      ? null
      : clamp(roundToFirstDecimal(50 + 10 * growthZScore), 20, 80);
  const currentBand = getRatingBand(currentRating);
  const nextBand = RATING_BANDS.find((band) => band.min > currentRating) ?? null;

  return {
    currentRating,
    highestRating,
    currentBand,
    nextBand,
    weightedAveragePerformance: performanceStats.average,
    weightedPerformanceStdDev: performanceStats.stdDev,
    performanceContestCount: fitnessRows.length,
    performanceDecayDays: PERFORMANCE_DECAY_DAYS,
    fitnessScore,
    growthPressure: growthStats.average,
    growthPressureStdDev: growthStats.stdDev,
    growthScore,
    ...getRatingFitnessMessage(absolutePerformanceZScore, performanceZScore),
    ...getGrowthPressureMessage(growthStats.average, growthZScore),
  };
}

function roundToFirstDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function summarizeWeightedRatingHistory(
  rows: RatingHistoryRow[],
  getValue: (row: RatingHistoryRow) => number
) {
  const latestEndTime = rows.at(-1)?.endTime;
  if (!latestEndTime) {
    return { average: null, stdDev: null };
  }

  const weightedRows = rows.map((row) => ({
    value: getValue(row),
    weight: calculatePerformanceWeight(row.endTime, latestEndTime),
  }));
  const weightSum = weightedRows.reduce((sum, row) => sum + row.weight, 0);
  if (weightSum === 0) {
    return { average: null, stdDev: null };
  }

  const mean =
    weightedRows.reduce((sum, row) => sum + row.value * row.weight, 0) /
    weightSum;
  const variance =
    weightedRows.reduce(
      (sum, row) => sum + row.weight * (row.value - mean) ** 2,
      0
    ) / weightSum;

  return {
    average: Math.round(mean),
    stdDev: Math.round(Math.sqrt(variance)),
  };
}

function calculatePerformanceWeight(endTime: Date, latestEndTime: Date) {
  const daysAgo = Math.max(
    0,
    (latestEndTime.getTime() - endTime.getTime()) / DAY_MS
  );
  return Math.exp(-daysAgo / PERFORMANCE_DECAY_DAYS);
}

function getRatingFitnessMessage(
  absolutePerformanceZScore: number | null,
  performanceZScore: number | null
) {
  if (absolutePerformanceZScore === null || performanceZScore === null) {
    return {
      label: '未計測',
      description: 'Rated参加の履歴が増えると、現在レートとの噛み合いを見られます。',
    };
  }
  if (absolutePerformanceZScore <= 0.5) {
    return {
      label: 'かなり適正',
      description: '現在レートは直近Perfの中心付近にあります。',
    };
  }
  if (performanceZScore > 0) {
    return absolutePerformanceZScore <= 1
      ? {
          label: '上昇余地あり',
          description: '直近Perfの中心は現在レートより少し高めです。',
        }
      : {
          label: '伸びしろ大',
          description: '直近Perfの中心は現在レートをはっきり上回っています。',
        };
  }
  return absolutePerformanceZScore <= 1
    ? {
        label: 'やや高め',
        description: '現在レートは直近Perfの中心より少し高めです。',
      }
    : {
        label: '踏ん張りどころ',
        description: '現在レートは直近Perfの中心をはっきり上回っています。',
      };
}

function getGrowthPressureMessage(
  growthPressure: number | null,
  growthZScore: number | null
) {
  if (growthPressure === null || growthZScore === null) {
    return {
      growthLabel: '未計測',
      growthDescription: 'Rated参加の履歴が増えると、当時レートに対するPerfの先行度を見られます。',
    };
  }
  if (growthZScore >= 1) {
    return {
      growthLabel: '強い上昇圧',
      growthDescription: '当時レートを大きく上回るPerfが多い状態です。',
    };
  }
  if (growthZScore > 0.3) {
    return {
      growthLabel: '上昇圧あり',
      growthDescription: '当時レートより高いPerfを出す傾向があります。',
    };
  }
  if (growthZScore >= -0.3) {
    return {
      growthLabel: '安定',
      growthDescription: '当時レートとPerfが近い水準で推移しています。',
    };
  }
  if (growthZScore >= -1) {
    return {
      growthLabel: 'やや停滞',
      growthDescription: '当時レートよりPerfが少し低めに出る傾向があります。',
    };
  }
  return {
    growthLabel: '調整期',
    growthDescription: '当時レートを下回るPerfが多く、立て直し中の状態です。',
  };
}
