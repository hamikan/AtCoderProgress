import assert from 'node:assert/strict';
import test from 'node:test';

import type { RatingHistoryPersistenceRecord } from '@/features/ratings/types';

import { selectRatingHistoryWrites } from './select-rating-history-writes';

function record(
  contestScreenName: string,
  overrides: Partial<RatingHistoryPersistenceRecord> = {}
): RatingHistoryPersistenceRecord {
  return {
    atcoderAccountId: 'tourist',
    isRated: true,
    place: 10,
    oldRating: 1000,
    newRating: 1050,
    performance: 1400,
    innerPerformance: 1400,
    contestScreenName,
    contestName: 'AtCoder Beginner Contest',
    contestNameEn: 'AtCoder Beginner Contest',
    endTime: new Date('2026-11-01T13:40:00.000Z'),
    ...overrides,
  };
}

test('selectRatingHistoryWrites adds contests that are not stored yet', () => {
  const writes = selectRatingHistoryWrites([record('abc400')], [record('abc400'), record('abc401')]);

  assert.deepEqual(writes, { newRecords: [record('abc401')], changedRecords: [] });
});

test('selectRatingHistoryWrites rewrites a stored contest whose result changed', () => {
  const recalculated = record('abc400', { newRating: 1040, performance: 1380 });
  const unrated = record('abc401', { isRated: false });
  const writes = selectRatingHistoryWrites(
    [record('abc400'), record('abc401'), record('abc402')],
    [recalculated, unrated, record('abc402')]
  );

  assert.deepEqual(writes, { newRecords: [], changedRecords: [recalculated, unrated] });
});

test('selectRatingHistoryWrites keeps stored contests that the fetch does not return', () => {
  const writes = selectRatingHistoryWrites([record('abc400')], []);

  assert.deepEqual(writes, { newRecords: [], changedRecords: [] });
});
