import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ATCODER_ID_FETCH_INTERVAL_MS,
  decideAtCoderIdChange,
} from './atcoder-id-change-policy';

const NOW = new Date('2026-11-07T00:00:00.000Z');

function minutesAgo(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60 * 1000);
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
  assert.deepEqual(
    decide({ needsFetch: false, recentFetchTimes: [minutesAgo(1)] }),
    { status: 'allowed' }
  );
});

test('blocks a new-ID fetch until the interval since the latest one has passed', () => {
  assert.deepEqual(
    decide({ recentFetchTimes: [minutesAgo(4), minutesAgo(1)] }),
    {
      availableAt: new Date(minutesAgo(1).getTime() + ATCODER_ID_FETCH_INTERVAL_MS),
      status: 'blocked',
    }
  );
});

test('allows a new-ID fetch once the interval has passed', () => {
  assert.deepEqual(decide({ recentFetchTimes: [minutesAgo(5)] }), {
    status: 'allowed',
  });
});
