import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSolutionSidebarHierarchy } from './solution-sidebar-hierarchy';
import type { SolutionListItem } from '@/features/solutions/types';

function listItem(contestId: string, problemIndex = 'A'): SolutionListItem {
  return {
    latestSolutionId: `${contestId}_${problemIndex}`,
    problemId: `${contestId}_${problemIndex.toLowerCase()}`,
    problemIndex,
    problemName: `Problem ${problemIndex}`,
    contestId,
    difficulty: null,
    updatedAt: '2026-10-31T00:00:00.000Z',
    solutionCount: 1,
    records: [],
  };
}

test('buildSolutionSidebarHierarchy groups ADT contests under their kind, newest first', () => {
  const hierarchy = buildSolutionSidebarHierarchy([
    listItem('adt_all_20231220_2'),
    listItem('adt_all_20241015_1'),
    listItem('adt_easy_20231220_2'),
    listItem('adt_all_20241015_3'),
    listItem('adt_hard_20231017_2'),
  ]);

  assert.deepEqual(
    hierarchy.map((group) => group.type),
    ['ADT_ALL', 'ADT_EASY', 'ADT_HARD']
  );
  assert.deepEqual(
    hierarchy[0].contests.map(({ contestId, label }) => ({ contestId, label })),
    [
      { contestId: 'adt_all_20241015_3', label: '2024/10/15 #3' },
      { contestId: 'adt_all_20241015_1', label: '2024/10/15 #1' },
      { contestId: 'adt_all_20231220_2', label: '2023/12/20 #2' },
    ]
  );
});

test('buildSolutionSidebarHierarchy keeps ABC, ARC and AGC first with newest contests first', () => {
  const hierarchy = buildSolutionSidebarHierarchy([
    listItem('ahc030'),
    listItem('abc100'),
    listItem('adt_all_20241015_1'),
    listItem('agc001'),
    listItem('abc420'),
    listItem('arc150'),
  ]);

  assert.deepEqual(
    hierarchy.map((group) => group.type),
    ['ABC', 'ARC', 'AGC', 'ADT_ALL', 'AHC']
  );
  assert.deepEqual(
    hierarchy[0].contests.map((contest) => contest.label),
    ['420', '100']
  );
});

test('buildSolutionSidebarHierarchy sorts problems by index within a contest', () => {
  const [abc] = buildSolutionSidebarHierarchy([
    listItem('abc420', 'C'),
    listItem('abc420', 'A'),
    listItem('abc420', 'B'),
  ]);

  assert.deepEqual(
    abc.contests[0].problems.map((problem) => problem.problemIndex),
    ['A', 'B', 'C']
  );
});

test('buildSolutionSidebarHierarchy falls back to the whole ID for unknown contest formats', () => {
  const hierarchy = buildSolutionSidebarHierarchy([
    listItem('practice'),
    listItem('adt_top'),
  ]);

  assert.deepEqual(
    hierarchy.map((group) => ({ type: group.type, label: group.contests[0].label })),
    [
      { type: 'ADT_TOP', label: '' },
      { type: 'PRACTICE', label: '' },
    ]
  );
});
