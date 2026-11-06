import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ATCODER_ID_FETCH_LIMIT,
  ATCODER_ID_FETCH_WINDOW_MS,
  decideAtCoderIdChange,
} from './atcoder-id-change-policy';

const NOW = new Date('2026-11-07T00:00:00.000Z');

function hoursAgo(hours: number): Date {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000);
}

function decide(overrides: Partial<Parameters<typeof decideAtCoderIdChange>[0]>) {
  return decideAtCoderIdChange({
    currentAtCoderId: 'chokudai',
    nextAtCoderId: 'tourist',
    needsFetch: true,
    recentFetchTimes: [],
    now: NOW,
    ...overrides,
  });
}

test('first registration is allowed', () => {
  assert.deepEqual(decide({ currentAtCoderId: null }), { status: 'allowed' });
});

test('submitting the current AtCoder ID is a no-op, ignoring case', () => {
  assert.deepEqual(decide({ nextAtCoderId: 'chokudai' }), { status: 'unchanged' });
  assert.deepEqual(decide({ nextAtCoderId: 'Chokudai' }), { status: 'unchanged' });
});

test('switching to an AtCoder ID whose data is stored is never limited', () => {
  const recentFetchTimes = Array.from({ length: ATCODER_ID_FETCH_LIMIT + 2 }, () =>
    hoursAgo(1)
  );

  assert.deepEqual(decide({ needsFetch: false, recentFetchTimes }), {
    status: 'allowed',
  });
});

test('allows new-ID fetches until the daily limit', () => {
  const recentFetchTimes = Array.from({ length: ATCODER_ID_FETCH_LIMIT - 1 }, () =>
    hoursAgo(1)
  );

  assert.deepEqual(decide({ recentFetchTimes }), { status: 'allowed' });
});

test('blocks a new-ID fetch at the limit until the oldest one leaves the window', () => {
  const recentFetchTimes = [hoursAgo(1), hoursAgo(20), hoursAgo(5)];

  assert.deepEqual(decide({ recentFetchTimes }), {
    availableAt: new Date(hoursAgo(20).getTime() + ATCODER_ID_FETCH_WINDOW_MS),
    status: 'blocked',
  });
});

test('ignores fetches older than the window', () => {
  const recentFetchTimes = [hoursAgo(1), hoursAgo(2), hoursAgo(24), hoursAgo(30)];

  assert.deepEqual(decide({ recentFetchTimes }), { status: 'allowed' });
});
