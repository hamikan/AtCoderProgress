import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeSolutionRouteParams } from './params';

test('normalizeSolutionRouteParams maps the legacy problemId segment to solutionId', () => {
  assert.deepEqual(normalizeSolutionRouteParams({ problemId: 'solution_123' }), {
    solutionId: 'solution_123',
  });
});

test('normalizeSolutionRouteParams rejects invalid route params', () => {
  assert.throws(() => normalizeSolutionRouteParams({ problemId: '../solution' }), {
    message: 'Invalid solution ID',
  });
});
