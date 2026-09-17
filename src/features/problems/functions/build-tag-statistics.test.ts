import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildOfficialTagStatistics,
  buildUnlinkedTagStatistics,
  getProblemIdsByUserTag,
} from './build-tag-statistics';

test('buildOfficialTagStatistics applies user labels without duplicating master tags', () => {
  const result = buildOfficialTagStatistics({
    userTags: [
      { id: 'user-linked', name: 'My DP', tagId: 'dp' },
      { id: 'user-free', name: '復習', tagId: null },
    ],
    masterTags: [
      { id: 'dp', name: 'Dynamic Programming' },
      { id: 'graph', name: 'Graph' },
      { id: 'unused', name: 'Unused' },
    ],
    totalCounts: [
      { tagId: 'dp', _count: { _all: 4 } },
      { tagId: 'graph', _count: { _all: 2 } },
    ],
    solvedCounts: [{ tagId: 'dp', _count: { _all: 1 } }],
  });

  assert.deepEqual(result.stats.map((tag) => tag.name), ['My DP', 'Graph']);
  assert.equal(result.stats[0].score, 25);
  assert.deepEqual(result.unlinkedUserTags.map((tag) => tag.id), ['user-free']);
});

test('buildUnlinkedTagStatistics counts unique solved problems', () => {
  const problemIdsByTag = getProblemIdsByUserTag([
    { userTagId: 'user-free', solution: { problemId: 'a' } },
    { userTagId: 'user-free', solution: { problemId: 'a' } },
    { userTagId: 'user-free', solution: { problemId: 'b' } },
  ]);
  const stats = buildUnlinkedTagStatistics({
    problemIdsByTag,
    solvedProblemIds: new Set(['a']),
    userTags: [{ id: 'user-free', name: '復習', tagId: null }],
  });

  assert.deepEqual(stats, [{
    tagId: 'user-free',
    name: '復習',
    score: 50,
    total: 2,
    solved: 1,
    type: 'unofficial',
  }]);
});
