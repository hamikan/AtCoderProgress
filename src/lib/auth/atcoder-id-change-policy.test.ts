import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ATCODER_ID_CHANGE_COOLDOWN_MS,
  decideAtCoderIdChange,
} from './atcoder-id-change-policy';

const NOW = new Date('2026-07-14T00:00:00.000Z');

test('first registration is allowed', () => {
  assert.deepEqual(decideAtCoderIdChange(null, null, 'chokudai', NOW), {
    status: 'allowed',
  });
});

test('submitting the current AtCoder ID is a no-op', () => {
  assert.deepEqual(
    decideAtCoderIdChange('chokudai', NOW, 'chokudai', NOW),
    { status: 'unchanged' }
  );
});

test('changing an AtCoder ID is blocked for seven days', () => {
  const changedAt = new Date(NOW.getTime() - ATCODER_ID_CHANGE_COOLDOWN_MS + 1);
  const availableAt = new Date(
    changedAt.getTime() + ATCODER_ID_CHANGE_COOLDOWN_MS
  );

  assert.deepEqual(
    decideAtCoderIdChange('chokudai', changedAt, 'tourist', NOW),
    {
      availableAt,
      status: 'blocked',
    }
  );
});

test('changing an AtCoder ID is allowed at the cooldown boundary', () => {
  const changedAt = new Date(NOW.getTime() - ATCODER_ID_CHANGE_COOLDOWN_MS);

  assert.deepEqual(
    decideAtCoderIdChange('chokudai', changedAt, 'tourist', NOW),
    { status: 'allowed' }
  );
});

test('legacy users without a change timestamp can change once', () => {
  assert.deepEqual(
    decideAtCoderIdChange('chokudai', null, 'tourist', NOW),
    { status: 'allowed' }
  );
});
