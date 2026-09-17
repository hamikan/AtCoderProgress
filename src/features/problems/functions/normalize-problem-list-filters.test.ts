import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeProblemListFilters,
} from './normalize-problem-list-filters';

test('normalizeProblemListFilters clamps programmatic filters too', () => {
  assert.deepEqual(
    normalizeProblemListFilters({
      contestType: 'BAD',
      difficultyMax: 9999,
      difficultyMin: -100,
      order: 'sideways',
      orderBy: 'unknown',
      page: Number.NaN,
      pageSize: 500,
      status: 'NOPE',
      tags: [' ok ', '', 'x'.repeat(80)],
    }),
    {
      contestType: 'ALL',
      difficultyMax: 4000,
      difficultyMin: 0,
      order: 'desc',
      orderBy: 'contestDate',
      page: 1,
      pageSize: 50,
      status: 'ALL',
      tags: ['ok'],
    }
  );
});

test('normalizeProblemListFilters removes personal status filters without a user', () => {
  assert.equal(
    normalizeProblemListFilters({ status: 'AC' }).status,
    'ALL'
  );
});
