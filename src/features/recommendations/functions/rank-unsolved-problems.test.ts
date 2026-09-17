import assert from 'node:assert/strict';
import test from 'node:test';

import { rankUnsolvedProblems } from './rank-unsolved-problems';

test('rankUnsolvedProblems combines stars, weak-tag bonuses, and supplied randomness', () => {
  const candidates = [
    {
      averageStars: 3,
      contestId: 'abc001',
      difficulty: 100,
      id: 'abc001_a',
      name: 'A',
      randomBonus: 0,
      tagIds: ['weak'],
    },
    {
      averageStars: 3.7,
      contestId: 'abc002',
      difficulty: 200,
      id: 'abc002_a',
      name: 'B',
      randomBonus: 0,
      tagIds: [],
    },
    {
      averageStars: 4,
      contestId: 'abc003',
      difficulty: 300,
      id: 'abc003_a',
      name: 'C',
      randomBonus: 0,
      tagIds: ['strong'],
    },
  ];
  const originalCandidates = structuredClone(candidates);

  const result = rankUnsolvedProblems(candidates, [
    { name: 'Weak', score: 20, solved: 1, tagId: 'weak', total: 5, type: 'official' },
    { name: 'Strong', score: 80, solved: 4, tagId: 'strong', total: 5, type: 'official' },
    { name: 'Small', score: 0, solved: 0, tagId: 'small', total: 4, type: 'official' },
    { name: 'Private', score: 0, solved: 0, tagId: 'private', total: 10, type: 'unofficial' },
  ]);

  assert.deepEqual(result.map(({ id }) => id), ['abc003_a', 'abc001_a']);
  assert.deepEqual(result.map(({ reason }) => reason), ['★:4.0', '★:3.0']);
  assert.deepEqual(candidates, originalCandidates);
});

test('rankUnsolvedProblems respects the requested result limit', () => {
  const result = rankUnsolvedProblems(
    [
      {
        averageStars: 3,
        contestId: 'abc001',
        difficulty: null,
        id: 'abc001_a',
        name: 'A',
        randomBonus: 0,
        tagIds: [],
      },
    ],
    [],
    0
  );

  assert.deepEqual(result, []);
});
