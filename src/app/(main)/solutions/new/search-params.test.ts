import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeNewSolutionSearchParams } from './search-params';

test('normalizeNewSolutionSearchParams keeps valid ids', () => {
  assert.deepEqual(
    normalizeNewSolutionSearchParams({ contestId: 'abc001', problemId: 'abc001_a' }),
    { contestId: 'abc001', problemId: 'abc001_a' }
  );
});

test('normalizeNewSolutionSearchParams drops invalid ids', () => {
  assert.deepEqual(
    normalizeNewSolutionSearchParams({ contestId: 'abc/001', problemId: '../abc001_a' }),
    { contestId: null, problemId: null }
  );
});
