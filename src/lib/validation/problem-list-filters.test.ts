import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeProblemListFilters,
} from './problem-list-filters';

test('normalizeProblemListFilters clamps programmatic filters too', () => {
  assert.deepEqual(
    normalizeProblemListFilters({
      contestType: 'BAD',
      difficulty_max: 9999,
      difficulty_min: -100,
      order: 'sideways',
      orderBy: 'unknown',
      page: Number.NaN,
      pageSize: 500,
      status: 'NOPE',
      tags: [' ok ', '', 'x'.repeat(80)],
    }),
    {
      contestType: 'ALL',
      difficulty_max: 4000,
      difficulty_min: 0,
      order: 'desc',
      orderBy: 'contestDate',
      page: 1,
      pageSize: 50,
      status: 'ALL',
      tags: ['ok'],
    }
  );
});
