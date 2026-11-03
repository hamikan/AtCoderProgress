import assert from 'node:assert/strict';
import test from 'node:test';

import { endLinkAttempt, tryBeginLinkAttempt } from './link-attempt-guard';

test('link attempt guard allows one attempt per user at a time', () => {
  assert.equal(tryBeginLinkAttempt('user-1'), true);
  assert.equal(tryBeginLinkAttempt('user-1'), false);
  assert.equal(tryBeginLinkAttempt('user-2'), true);

  endLinkAttempt('user-1');
  assert.equal(tryBeginLinkAttempt('user-1'), true);

  endLinkAttempt('user-1');
  endLinkAttempt('user-2');
});
