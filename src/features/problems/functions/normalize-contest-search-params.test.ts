import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeContestSearchParams } from './normalize-contest-search-params';

test('normalizeContestSearchParams normalizes contest page query params', () => {
  assert.deepEqual(
    normalizeContestSearchParams({ contestType: 'ARC', order: 'ASC' }),
    { contestType: 'arc', cursor: null, order: 'asc' }
  );
});

test('normalizeContestSearchParams falls back on invalid query params', () => {
  assert.deepEqual(
    normalizeContestSearchParams({ contestType: 'bad', order: 'sideways' }),
    { contestType: 'abc', cursor: null, order: 'desc' }
  );
});

test('normalizeContestSearchParams keeps only cursors matching the contest kind', () => {
  assert.deepEqual(
    normalizeContestSearchParams({ contestType: 'arc', cursor: 'arc100' }),
    { contestType: 'arc', cursor: 'arc100', order: 'desc' }
  );
  assert.deepEqual(
    normalizeContestSearchParams({ contestType: 'arc', cursor: 'abc100' }),
    { contestType: 'arc', cursor: null, order: 'desc' }
  );
});
