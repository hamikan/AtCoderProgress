import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildContestCacheScope,
  buildContestListCacheKey,
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

test('buildContestCacheScope changes when the user, linked ID or fetch time changes', () => {
  const fetchedAt = new Date('2026-11-05T00:00:00Z');
  const scope = buildContestCacheScope({ id: 'user-1', atcoderId: 'old_id' }, fetchedAt);

  assert.equal(
    buildContestCacheScope({ id: 'user-1', atcoderId: 'old_id' }, new Date(fetchedAt)),
    scope
  );
  assert.notEqual(
    buildContestCacheScope({ id: 'user-1', atcoderId: 'new_id' }, fetchedAt),
    scope
  );
  assert.notEqual(
    buildContestCacheScope({ id: 'user-2', atcoderId: 'old_id' }, fetchedAt),
    scope
  );
  assert.notEqual(
    buildContestCacheScope(
      { id: 'user-1', atcoderId: 'old_id' },
      new Date('2026-11-06T00:00:00Z')
    ),
    scope
  );
  assert.equal(buildContestCacheScope(null, null), 'anonymous');
});

test('buildContestListCacheKey separates scopes, contest types and orders', () => {
  const key = buildContestListCacheKey('scope-1', 'abc', 'desc');

  assert.notEqual(buildContestListCacheKey('scope-2', 'abc', 'desc'), key);
  assert.notEqual(buildContestListCacheKey('scope-1', 'arc', 'desc'), key);
  assert.notEqual(buildContestListCacheKey('scope-1', 'abc', 'asc'), key);
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
