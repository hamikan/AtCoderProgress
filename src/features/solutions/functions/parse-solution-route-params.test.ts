import assert from 'node:assert/strict';
import test from 'node:test';

import { parseSolutionRouteParams } from './parse-solution-route-params';

test('parseSolutionRouteParams parses a valid solutionId segment', () => {
  assert.deepEqual(parseSolutionRouteParams({ solutionId: 'solution_123' }), {
    solutionId: 'solution_123',
  });
});

test('parseSolutionRouteParams rejects invalid route params', () => {
  assert.throws(() => parseSolutionRouteParams({ solutionId: '../solution' }), {
    message: 'Invalid solution ID',
  });
});
