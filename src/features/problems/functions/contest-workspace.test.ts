import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildContests,
  buildContestStats,
  getContestCursorFilter,
  getContestProblemIds,
} from './contest-workspace';

test('contest workspace functions map rows and collect problem ids', () => {
  const contests = buildContests([
    {
      id: 'abc001',
      startEpochSecond: 100,
      durationSecond: BigInt(7200),
      problems: [
        {
          problemIndex: 'A',
          problem: {
            id: 'abc001_a',
            name: 'A',
            difficulty: 100,
            totalSolutionCount: 10,
          },
        },
      ],
    },
  ]);

  assert.equal(contests[0].durationSecond, 7200);
  assert.equal(contests[0].problems.A?.name, 'A');
  assert.deepEqual(getContestProblemIds(contests), ['abc001_a']);
});

test('contest workspace functions calculate stats and cursor filters', () => {
  assert.deepEqual(
    buildContestStats({ total: 10, acCount: 3, tryingCount: 2 }),
    { total: 10, ac: 3, trying: 2, unsolved: 5 }
  );
  assert.deepEqual(getContestCursorFilter('desc', 'abc100'), { lt: 'abc100' });
  assert.deepEqual(getContestCursorFilter('asc', 'abc100'), { gt: 'abc100' });
  assert.deepEqual(getContestCursorFilter('asc', null), {});
});
