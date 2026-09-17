import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeSolutionSearchParams } from './normalize-solution-search-params';

test('normalizeSolutionSearchParams keeps valid ids', () => {
  assert.deepEqual(
    normalizeSolutionSearchParams({ contestId: 'abc001', problemId: 'abc001_a' }),
    { contestId: 'abc001', problemId: 'abc001_a', problemSearch: '' }
  );
});

test('normalizeSolutionSearchParams drops invalid ids', () => {
  assert.deepEqual(
    normalizeSolutionSearchParams({ contestId: 'abc/001', problemId: '../abc001_a' }),
    { contestId: null, problemId: null, problemSearch: '' }
  );
});

test('normalizeSolutionSearchParams normalizes a problem search query', () => {
  assert.deepEqual(normalizeSolutionSearchParams({ problemSearch: '  abc001  ' }), {
    contestId: null,
    problemId: null,
    problemSearch: 'abc001',
  });
});
