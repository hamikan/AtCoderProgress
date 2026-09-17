import assert from 'node:assert/strict';
import test from 'node:test';

import { rankSolvedProblems } from './rank-solved-problems';

test('rankSolvedProblems ranks review priority, stars, and elapsed days', () => {
  const currentEpochSecond = 2_000_000;
  const candidates = [
    {
      averageStars: 3,
      contestId: 'abc001',
      difficulty: 100,
      id: 'abc001_a',
      lastAcceptedEpochSecond: currentEpochSecond - 86_400,
      name: 'A',
      reviewPriority: 3,
    },
    {
      averageStars: 5,
      contestId: 'abc002',
      difficulty: 200,
      id: 'abc002_a',
      lastAcceptedEpochSecond: currentEpochSecond - 30 * 86_400,
      name: 'B',
      reviewPriority: 2,
    },
    {
      averageStars: 2,
      contestId: 'abc003',
      difficulty: null,
      id: 'abc003_a',
      lastAcceptedEpochSecond: currentEpochSecond - 20 * 86_400,
      name: 'C',
      reviewPriority: 3,
    },
  ];
  const originalCandidates = structuredClone(candidates);

  const result = rankSolvedProblems(candidates, currentEpochSecond);

  assert.deepEqual(result.map(({ id }) => id), ['abc003_a', 'abc001_a']);
  assert.deepEqual(result.map(({ reason }) => reason), [
    '振り返り優先度:3,  ★:2.0, 20d ago',
    '振り返り優先度:3,  ★:3.0, 1d ago',
  ]);
  assert.deepEqual(candidates, originalCandidates);
});
