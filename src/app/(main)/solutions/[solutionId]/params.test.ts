import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeSolutionRouteParams } from './params';

test('normalizeSolutionRouteParams keeps a valid solutionId segment', () => {
  assert.deepEqual(normalizeSolutionRouteParams({ solutionId: 'solution_123' }), {
    solutionId: 'solution_123',
  });
});

test('normalizeSolutionRouteParams rejects invalid route params', () => {
  assert.throws(() => normalizeSolutionRouteParams({ solutionId: '../solution' }), {
    message: 'Invalid solution ID',
  });
});
