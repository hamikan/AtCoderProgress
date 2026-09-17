import assert from 'node:assert/strict';
import test from 'node:test';

import { getContestProblemIndexes } from './get-contest-problem-indexes';

test('getContestProblemIndexes returns the visible columns for each contest kind', () => {
  assert.deepEqual(getContestProblemIndexes('abc'), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H/Ex']);
  assert.deepEqual(getContestProblemIndexes('arc'), ['A', 'B', 'C', 'D', 'E', 'F', 'F2']);
  assert.deepEqual(getContestProblemIndexes('agc'), ['A', 'B', 'C', 'D', 'E', 'F', 'F2']);
});
