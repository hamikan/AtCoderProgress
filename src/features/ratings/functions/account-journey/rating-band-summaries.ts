import { format } from 'date-fns';
import {
  DIFFICULTY_UNKNOWN_BUCKET,
  RATING_BANDS,
} from './constants';
import { buildFirstAcceptedByProblem } from './curriculum';
import {
  formatEpochDate,
  getDifficultyBucket,
  getRatingBand,
  resolveRatingAtEpoch,
  toPercentage,
} from './utils';
import type {
  DifficultyBucketSummary,
  RatingBandKey,
  RatingBandSummary,
} from '@/features/ratings/types/output/account-journey';
import type {
  FirstAcceptedProblem,
  RatingHistoryRow,
  SubmissionRow,
} from '@/features/ratings/types/input/account-journey-rows';

const DAY_MS = 24 * 60 * 60 * 1000;

export function buildRatingBandSummaries(
  ratingHistory: RatingHistoryRow[],
  submissions: SubmissionRow[]
): RatingBandSummary[] {
  const contestCountByBand = countRatedContestsByContestStartBand(ratingHistory);
  const acceptedByBand = groupAcceptedProblemsByBand(submissions, ratingHistory);
  const attemptedByBand = groupAttemptedProblemsByBand(submissions, ratingHistory);
  const attemptedDifficultiesByBand = groupAttemptedDifficultiesByBand(
    submissions,
    ratingHistory
  );
  const submissionStatsByBand = groupSubmissionStatsByBand(submissions, ratingHistory);
  const performanceByBand = groupPerformanceByContestStartBand(ratingHistory);
  const activityDatesByBand = groupActivityDatesByBand(ratingHistory, submissions);
  const periodDaysByBand = sumRatingPeriodDaysByBand(ratingHistory, submissions);

  return RATING_BANDS.map((band) => {
    const acceptedProblems = acceptedByBand.get(band.key) ?? [];
    const acceptedDifficulties = acceptedProblems
      .map((problem) => problem.difficulty)
      .filter((difficulty): difficulty is number => difficulty !== null);
    const acceptedDifficultyStats = summarizeDifficulties(acceptedDifficulties);
    const attemptedDifficulties = attemptedDifficultiesByBand.get(band.key) ?? [];
    const submissionStats = submissionStatsByBand.get(band.key) ?? {
      submissionCount: 0,
      acSubmissionCount: 0,
    };
    const activityDates = [...(activityDatesByBand.get(band.key) ?? new Set<string>())].toSorted();
    const totalDays = Math.max(
      periodDaysByBand.get(band.key) ?? 0,
      activityDates.length > 0 ? 1 : 0
    );
    const attemptedCount = attemptedByBand.get(band.key)?.size ?? 0;
    const acceptedCount = acceptedProblems.length;

    return {
      band,
      contestCount: contestCountByBand.get(band.key) ?? 0,
      totalDays,
      periodLabel: formatDurationDays(totalDays),
      activeDays: activityDates.length,
      submissionCount: submissionStats.submissionCount,
      acSubmissionCount: submissionStats.acSubmissionCount,
      attemptedCount,
      acceptedCount,
      averageDifficulty: acceptedDifficultyStats.average,
      medianDifficulty: acceptedDifficultyStats.median,
      minDifficulty: acceptedDifficultyStats.min,
      maxDifficulty: acceptedDifficultyStats.max,
      averageAttemptedDifficulty: average(attemptedDifficulties),
      acceptanceRate: toPercentage(
        submissionStats.acSubmissionCount,
        submissionStats.submissionCount
      ),
      solveRate: toPercentage(acceptedCount, attemptedCount),
      bestPerformance: performanceByBand.get(band.key) ?? null,
      firstActivityDate: activityDates[0] ?? null,
      lastActivityDate: activityDates.at(-1) ?? null,
      difficultyDistribution: buildDifficultyDistribution(acceptedProblems),
    };
  }).filter(
    (summary) =>
      summary.contestCount > 0 ||
      summary.attemptedCount > 0 ||
      summary.acceptedCount > 0 ||
      summary.submissionCount > 0 ||
      summary.totalDays > 0
  );
}

function groupAcceptedProblemsByBand(
  submissions: SubmissionRow[],
  ratingHistory: RatingHistoryRow[]
) {
  const firstAcceptedByProblem = buildFirstAcceptedByProblem(submissions);

  return Array.from(firstAcceptedByProblem.values()).reduce((grouped, accepted) => {
    const band = getRatingBand(resolveRatingAtEpoch(accepted.epochSecond, ratingHistory));
    const current = grouped.get(band.key) ?? [];

    return new Map(grouped).set(band.key, [...current, accepted]);
  }, new Map<RatingBandKey, FirstAcceptedProblem[]>());
}

function buildDifficultyDistribution(
  acceptedProblems: FirstAcceptedProblem[]
): DifficultyBucketSummary[] {
  const total = acceptedProblems.length;
  if (total === 0) return [];

  const counts = acceptedProblems.reduce((countByBucket, problem) => {
    const bucket = getDifficultyBucket(problem.difficulty);
    const current = countByBucket.get(bucket.key) ?? 0;

    return new Map(countByBucket).set(bucket.key, current + 1);
  }, new Map<string, number>());
  const buckets = [...RATING_BANDS, DIFFICULTY_UNKNOWN_BUCKET];

  return buckets
    .map((bucket) => {
      const count = counts.get(bucket.key) ?? 0;

      return {
        key: bucket.key,
        label: bucket.label,
        rangeLabel: bucket.rangeLabel,
        count,
        percentage: toPercentage(count, total),
        textColor: bucket.textColor,
        bgColor: bucket.bgColor,
        barColor: bucket.barColor,
      };
    })
    .filter((bucket) => bucket.count > 0);
}

function groupAttemptedProblemsByBand(
  submissions: SubmissionRow[],
  ratingHistory: RatingHistoryRow[]
) {
  return submissions.reduce((grouped, submission) => {
    const band = getRatingBand(resolveRatingAtEpoch(submission.epochSecond, ratingHistory));
    const current = grouped.get(band.key) ?? new Set<string>();

    return new Map(grouped).set(band.key, new Set([...current, submission.problemId]));
  }, new Map<RatingBandKey, Set<string>>());
}

function groupAttemptedDifficultiesByBand(
  submissions: SubmissionRow[],
  ratingHistory: RatingHistoryRow[]
) {
  const problemDifficultiesByBand = submissions.reduce((grouped, submission) => {
    const band = getRatingBand(resolveRatingAtEpoch(submission.epochSecond, ratingHistory));
    const current = grouped.get(band.key) ?? new Map<string, number | null>();

    if (current.has(submission.problemId)) return grouped;

    return new Map(grouped).set(
      band.key,
      new Map(current).set(submission.problemId, submission.problem.difficulty)
    );
  }, new Map<RatingBandKey, Map<string, number | null>>());

  return [...problemDifficultiesByBand.entries()].reduce((grouped, [bandKey, problems]) => {
    const difficulties = [...problems.values()].filter(
      (difficulty): difficulty is number => difficulty !== null
    );

    return new Map(grouped).set(bandKey, difficulties);
  }, new Map<RatingBandKey, number[]>());
}

function groupSubmissionStatsByBand(
  submissions: SubmissionRow[],
  ratingHistory: RatingHistoryRow[]
) {
  return submissions.reduce((statsByBand, submission) => {
    const band = getRatingBand(resolveRatingAtEpoch(submission.epochSecond, ratingHistory));
    const current = statsByBand.get(band.key) ?? {
      submissionCount: 0,
      acSubmissionCount: 0,
    };
    const next = {
      submissionCount: current.submissionCount + 1,
      acSubmissionCount: current.acSubmissionCount + (submission.result === 'AC' ? 1 : 0),
    };

    return new Map(statsByBand).set(band.key, next);
  }, new Map<RatingBandKey, { submissionCount: number; acSubmissionCount: number }>());
}

function countRatedContestsByContestStartBand(ratingHistory: RatingHistoryRow[]) {
  return ratingHistory.reduce((countByBand, row) => {
    const band = getRatingBand(row.oldRating);
    const current = countByBand.get(band.key) ?? 0;

    return new Map(countByBand).set(band.key, current + 1);
  }, new Map<RatingBandKey, number>());
}

function groupPerformanceByContestStartBand(ratingHistory: RatingHistoryRow[]) {
  return ratingHistory.reduce((performanceByBand, row) => {
    const band = getRatingBand(row.oldRating);
    const current = performanceByBand.get(band.key) ?? null;
    const next = current === null ? row.performance : Math.max(current, row.performance);

    return new Map(performanceByBand).set(band.key, next);
  }, new Map<RatingBandKey, number>());
}

function groupActivityDatesByBand(
  ratingHistory: RatingHistoryRow[],
  submissions: SubmissionRow[]
) {
  const ratingActivities = ratingHistory.map((row) => ({
    bandKey: getRatingBand(row.oldRating).key,
    date: format(row.endTime, 'yyyy-MM-dd'),
  }));
  const submissionActivities = submissions.map((submission) => ({
    bandKey: getRatingBand(resolveRatingAtEpoch(submission.epochSecond, ratingHistory)).key,
    date: formatEpochDate(submission.epochSecond),
  }));

  return [...ratingActivities, ...submissionActivities].reduce((grouped, activity) => {
    const current = grouped.get(activity.bandKey) ?? new Set<string>();

    return new Map(grouped).set(activity.bandKey, new Set([...current, activity.date]));
  }, new Map<RatingBandKey, Set<string>>());
}

function sumRatingPeriodDaysByBand(
  ratingHistory: RatingHistoryRow[],
  submissions: SubmissionRow[]
) {
  const timelineStart = getFirstKnownActivityDate(ratingHistory, submissions);

  if (timelineStart === null) return new Map<RatingBandKey, number>();

  if (ratingHistory.length === 0) {
    const timelineEnd = getLastKnownActivityDate(ratingHistory, submissions) ?? timelineStart;
    return new Map([[getRatingBand(0).key, countPeriodDays(timelineStart, timelineEnd)]]);
  }

  const now = new Date();
  const firstRow = ratingHistory[0];
  const initialPeriod =
    timelineStart.getTime() < firstRow.endTime.getTime()
      ? [
          {
            bandKey: getRatingBand(firstRow.oldRating).key,
            start: timelineStart,
            end: firstRow.endTime,
          },
        ]
      : [];
  const ratingPeriods = ratingHistory.map((row, index) => ({
    bandKey: getRatingBand(row.newRating).key,
    start: row.endTime,
    end: ratingHistory[index + 1]?.endTime ?? now,
  }));

  return [...initialPeriod, ...ratingPeriods].reduce((daysByBand, period) => {
    const days = countPeriodDays(period.start, period.end);
    if (days === 0) return daysByBand;

    const current = daysByBand.get(period.bandKey) ?? 0;
    return new Map(daysByBand).set(period.bandKey, current + days);
  }, new Map<RatingBandKey, number>());
}

function getFirstKnownActivityDate(
  ratingHistory: RatingHistoryRow[],
  submissions: SubmissionRow[]
) {
  const timestamps = [
    ...ratingHistory.map((row) => row.endTime.getTime()),
    ...submissions.map((submission) => submission.epochSecond * 1000),
  ];

  if (timestamps.length === 0) return null;

  return new Date(Math.min(...timestamps));
}

function getLastKnownActivityDate(
  ratingHistory: RatingHistoryRow[],
  submissions: SubmissionRow[]
) {
  const timestamps = [
    ...ratingHistory.map((row) => row.endTime.getTime()),
    ...submissions.map((submission) => submission.epochSecond * 1000),
  ];

  if (timestamps.length === 0) return null;

  return new Date(Math.max(...timestamps));
}

function countPeriodDays(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;

  return Math.max(1, Math.ceil(diff / DAY_MS));
}

function formatDurationDays(totalDays: number) {
  if (totalDays === 0) return '-';

  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  if (months === 0) return `${days}日`;
  if (days === 0) return `${months}ヶ月`;
  return `${months}ヶ月 ${days}日`;
}

function summarizeDifficulties(values: number[]) {
  return {
    average: average(values),
    median: median(values),
    min: min(values),
    max: max(values),
  };
}

function average(values: number[]) {
  if (values.length === 0) return null;

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values: number[]) {
  if (values.length === 0) return null;

  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) return sorted[middle];

  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function min(values: number[]) {
  if (values.length === 0) return null;

  return values.reduce((lowest, value) => Math.min(lowest, value), values[0]);
}

function max(values: number[]) {
  if (values.length === 0) return null;

  return values.reduce((highest, value) => Math.max(highest, value), values[0]);
}
