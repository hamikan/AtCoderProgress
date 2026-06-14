import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeContestSearchParams } from './search-params';

test('normalizeContestSearchParams normalizes contest page query params', () => {
  assert.deepEqual(
    normalizeContestSearchParams({ contestType: 'ARC', order: 'ASC' }),
    { contestType: 'arc', order: 'asc' }
  );
});

test('normalizeContestSearchParams falls back on invalid query params', () => {
  assert.deepEqual(
    normalizeContestSearchParams({ contestType: 'bad', order: 'sideways' }),
    { contestType: 'abc', order: 'desc' }
  );
});
