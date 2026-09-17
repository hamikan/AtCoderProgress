import assert from 'node:assert/strict';
import test from 'node:test';

import { buildAnalyticsSummary } from './analytics-summary';
import { buildRatingFitness } from './rating-fitness';
import { buildRatingBandSummaries } from './rating-band-summaries';
import type {
  RatingHistoryRow,
  SubmissionRow,
} from '@/features/ratings/types';

const RATING_HISTORY: RatingHistoryRow[] = [
  {
    oldRating: 300,
    newRating: 450,
    performance: 700,
    contestName: 'Contest',
    contestScreenName: 'abc001.contest.atcoder.jp',
    endTime: new Date('2026-01-01T00:00:00.000Z'),
  },
];

const SUBMISSIONS: SubmissionRow[] = [
  {
    problemId: 'abc001_a',
    contestId: 'abc001',
    result: 'WA',
    epochSecond: 1_767_225_600,
    problem: { id: 'abc001_a', name: 'A', difficulty: 100 },
  },
  {
    problemId: 'abc001_a',
    contestId: 'abc001',
    result: 'AC',
    epochSecond: 1_767_225_700,
    problem: { id: 'abc001_a', name: 'A', difficulty: 100 },
  },
];

test('account journey summaries preserve empty-state semantics', () => {
  const bands = buildRatingBandSummaries([], []);

  assert.deepEqual(bands, []);
  assert.deepEqual(buildAnalyticsSummary([], [], bands), {
    acCount: 0,
    attemptedCount: 0,
    activeDays: 0,
    ratedContestCount: 0,
    activeBandCount: 0,
  });
  assert.equal(buildRatingFitness([]).label, '未計測');
});

test('account journey summaries count unique attempted and accepted problems', () => {
  const bands = buildRatingBandSummaries(RATING_HISTORY, SUBMISSIONS);
  const summary = buildAnalyticsSummary(RATING_HISTORY, SUBMISSIONS, bands);

  assert.equal(summary.attemptedCount, 1);
  assert.equal(summary.acCount, 1);
  assert.equal(summary.ratedContestCount, 1);
  assert.equal(bands.length > 0, true);
});
