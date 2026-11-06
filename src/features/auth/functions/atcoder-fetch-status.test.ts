import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ATCODER_FULL_FETCH_STALE_MS,
  getAtCoderFetchStatus,
} from './atcoder-fetch-status';

const NOW = new Date('2026-11-07T00:00:00.000Z');
const EMPTY = { submissionsLastFetchedAt: null, fetchStartedAt: null, fetchFailedAt: null };

test('an AtCoder ID with fetched data is ready', () => {
  assert.equal(
    getAtCoderFetchStatus({ ...EMPTY, submissionsLastFetchedAt: NOW }, NOW),
    'ready'
  );
});

test('a recently started fetch is in progress', () => {
  assert.equal(
    getAtCoderFetchStatus({ ...EMPTY, fetchStartedAt: new Date(NOW.getTime() - 60_000) }, NOW),
    'fetching'
  );
});

test('a fetch that has been running too long counts as failed', () => {
  assert.equal(
    getAtCoderFetchStatus(
      { ...EMPTY, fetchStartedAt: new Date(NOW.getTime() - ATCODER_FULL_FETCH_STALE_MS) },
      NOW
    ),
    'failed'
  );
});

test('a failed fetch, a missing account, or one never fetched counts as failed', () => {
  assert.equal(getAtCoderFetchStatus({ ...EMPTY, fetchFailedAt: NOW }, NOW), 'failed');
  assert.equal(getAtCoderFetchStatus(null, NOW), 'failed');
  assert.equal(getAtCoderFetchStatus(EMPTY, NOW), 'failed');
});
