import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSubmissionRefreshCursor,
  shouldRefreshAtCoderData,
  SUBMISSION_REFRESH_OVERLAP_SECONDS,
} from './atcoder-data-refresh-policy';

const NOW = new Date('2026-11-02T12:00:00.000Z');

test('shouldRefreshAtCoderData refreshes when never fetched or stale', () => {
  assert.equal(shouldRefreshAtCoderData(null, NOW), true);
  assert.equal(
    shouldRefreshAtCoderData(new Date('2026-11-02T10:59:59.000Z'), NOW),
    true
  );
  assert.equal(
    shouldRefreshAtCoderData(new Date('2026-11-02T11:00:00.000Z'), NOW),
    true
  );
  assert.equal(
    shouldRefreshAtCoderData(new Date('2026-11-02T11:00:01.000Z'), NOW),
    false
  );
});

test('getSubmissionRefreshCursor overlaps the newest stored submission by a day', () => {
  assert.equal(getSubmissionRefreshCursor(null), 0);
  assert.equal(
    getSubmissionRefreshCursor(1_700_000_000),
    1_700_000_000 - SUBMISSION_REFRESH_OVERLAP_SECONDS
  );
  assert.equal(getSubmissionRefreshCursor(100), 0);
});
