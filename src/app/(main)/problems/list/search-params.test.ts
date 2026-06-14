import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeProblemListSearchParams } from './search-params';

test('normalizeProblemListSearchParams normalizes url search params for the problem list page', () => {
  assert.deepEqual(
    normalizeProblemListSearchParams(
      {
        contestType: 'abc',
        difficulty_max: '200',
        difficulty_min: '500',
        order: 'ASC',
        orderBy: 'difficulty',
        page: '-3',
        search: '  shortest path  ',
        status: 'self_ac',
        tags: 'dp, graph,dp,,',
      },
      'user-1'
    ),
    {
      contestType: 'ABC',
      difficulty_max: 500,
      difficulty_min: 200,
      order: 'asc',
      orderBy: 'difficulty',
      page: 1,
      search: 'shortest path',
      status: 'SELF_AC',
      tags: ['dp', 'graph'],
      userId: 'user-1',
    }
  );
});
