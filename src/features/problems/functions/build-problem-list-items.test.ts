import assert from 'node:assert/strict';
import test from 'node:test';

import { buildProblemListItems } from './build-problem-list-items';
import type { ProblemListRow } from '@/features/problems/types';

function createRow(overrides: Partial<ProblemListRow> = {}): ProblemListRow {
  return {
    id: 'abc001_a',
    name: 'A',
    firstContestId: 'abc001',
    difficulty: 100,
    totalSolutionCount: 10,
    contests: [{ contestId: 'abc001', problemIndex: 'A' }],
    solutions: [],
    submissions: [],
    _count: { submissions: 0 },
    ...overrides,
  };
}

test('buildProblemListItems keeps anonymous rows visible as unsolved', () => {
  const [item] = buildProblemListItems([
    createRow({
      solutions: [{ status: 'REVIEW_AC' }],
      submissions: [{ id: 1 }],
      _count: { submissions: 3 },
    }),
  ]);

  assert.equal(item.status, 'UNSOLVED');
  assert.equal(item.problemIndex, 'A');
});

test('buildProblemListItems chooses the strongest saved status for a user', () => {
  const [item] = buildProblemListItems(
    [
      createRow({
        solutions: [{ status: 'TRYING' }, { status: 'SELF_AC' }],
      }),
    ],
    'user-1'
  );

  assert.equal(item.status, 'SELF_AC');
});

test('buildProblemListItems prefers an AC submission over a TRYING solution record', () => {
  const [upgraded, kept] = buildProblemListItems(
    [
      createRow({
        id: 'upgraded',
        solutions: [{ status: 'TRYING' }],
        submissions: [{ id: 1 }],
      }),
      createRow({
        id: 'kept',
        solutions: [{ status: 'REVIEW_AC' }],
        submissions: [{ id: 2 }],
      }),
    ],
    'user-1'
  );

  // A TRYING record must not hide an actual AC, while a richer record
  // status (REVIEW_AC) is kept as it is.
  assert.equal(upgraded.status, 'AC');
  assert.equal(kept.status, 'REVIEW_AC');
});

test('buildProblemListItems derives AC and trying from submissions', () => {
  const items = buildProblemListItems(
    [
      createRow({ id: 'accepted', submissions: [{ id: 1 }] }),
      createRow({ id: 'trying', _count: { submissions: 2 } }),
      createRow({ id: 'unknown-index', contests: [] }),
    ],
    'user-1'
  );

  assert.deepEqual(items.map((item) => item.status), ['AC', 'TRYING', 'UNSOLVED']);
  assert.equal(items[2].problemIndex, 'unknown');
});
