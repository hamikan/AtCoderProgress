import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildSolutionSidebarHierarchy,
  buildSolutionSidebarProblemOptions,
  buildSidebarTypeContestOptions,
  filterSidebarContestOptions,
  getSelectedSidebarGroupKeys,
  getSidebarContestIdPrefix,
  getSidebarContestKey,
  getSidebarProblemKey,
  getSidebarTypeKey,
} from './solution-sidebar-hierarchy';
import type {
  SolutionListItem,
  SolutionSidebarContestProblem,
} from '@/features/solutions/types';

function listItem(
  contestId: string,
  problemIndex = 'A',
  problemId = `${contestId}_${problemIndex.toLowerCase()}`
): SolutionListItem {
  return {
    latestSolutionId: `${contestId}_${problemIndex}`,
    problemId,
    problemIndex,
    problemName: `Problem ${problemIndex}`,
    contestId,
    difficulty: null,
    updatedAt: '2026-10-31T00:00:00.000Z',
    solutionCount: 1,
    records: [],
  };
}

function contestProblem(
  contestId: string,
  problemIndex: string,
  problemId = `${contestId}_${problemIndex.toLowerCase()}`
): SolutionSidebarContestProblem {
  return {
    contestId,
    problemId,
    problemIndex,
    problemName: `Problem ${problemIndex}`,
    difficulty: null,
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

test('buildSolutionSidebarHierarchy lists every problem of a recorded contest as an option', () => {
  const solutions = [listItem('abc420', 'B')];
  const [abc] = buildSolutionSidebarHierarchy(
    solutions,
    buildSolutionSidebarProblemOptions(
      [
        contestProblem('abc420', 'C'),
        contestProblem('abc420', 'A'),
        contestProblem('abc100', 'A'),
        contestProblem('abc420', 'B'),
      ],
      solutions
    )
  );

  assert.deepEqual(
    abc.contests.map((contest) => contest.contestId),
    ['abc420']
  );
  assert.deepEqual(
    abc.contests[0].problemOptions.map(({ problemIndex, recorded }) => ({
      problemIndex,
      recorded,
    })),
    [
      { problemIndex: 'A', recorded: false },
      { problemIndex: 'B', recorded: true },
      { problemIndex: 'C', recorded: false },
    ]
  );
});

test('buildSolutionSidebarHierarchy keeps recorded marks for solutions hidden by a search filter', () => {
  const allSolutions = [listItem('abc420', 'B'), listItem('abc420', 'C')];
  const options = buildSolutionSidebarProblemOptions(
    [contestProblem('abc420', 'B'), contestProblem('abc420', 'C')],
    allSolutions
  );
  const [abc] = buildSolutionSidebarHierarchy([allSolutions[0]], options);

  assert.deepEqual(
    abc.contests[0].problemOptions.map((option) => option.recorded),
    [true, true]
  );
});

test('buildSolutionSidebarProblemOptions marks a problem recorded only in the contest it was saved under', () => {
  const options = buildSolutionSidebarProblemOptions(
    [
      contestProblem('abc301', 'C', 'abc301_c'),
      contestProblem('adt_all_20231220_2', 'D', 'abc301_c'),
    ],
    [listItem('abc301', 'C', 'abc301_c')]
  );

  assert.deepEqual(
    options.map(({ contestId, recorded }) => ({ contestId, recorded })),
    [
      { contestId: 'abc301', recorded: true },
      { contestId: 'adt_all_20231220_2', recorded: false },
    ]
  );
});

test('buildSolutionSidebarHierarchy leaves options empty when contest problems are unknown', () => {
  const [abc] = buildSolutionSidebarHierarchy([listItem('abc420')]);

  assert.deepEqual(abc.contests[0].problemOptions, []);
});

test('getSelectedSidebarGroupKeys returns the groups that lead to the selected record', () => {
  const solutions = [
    { ...listItem('abc420', 'B'), records: [] },
    {
      ...listItem('adt_all_20231220_2', 'C', 'abc301_c'),
      records: [
        {
          id: 'solution_1',
          contestId: 'adt_all_20231220_2',
          title: null,
          createdAt: '2026-10-31T00:00:00.000Z',
          updatedAt: '2026-10-31T00:00:00.000Z',
          status: 'AC' as const,
        },
      ],
    },
  ];

  assert.deepEqual(getSelectedSidebarGroupKeys(solutions, 'solution_1'), [
    getSidebarTypeKey('ADT_ALL'),
    getSidebarContestKey('adt_all_20231220_2'),
    getSidebarProblemKey('adt_all_20231220_2', 'abc301_c'),
  ]);
});

test('getSelectedSidebarGroupKeys returns nothing without a matching selection', () => {
  const solutions = [listItem('abc420', 'B')];

  assert.deepEqual(getSelectedSidebarGroupKeys(solutions, null), []);
  assert.deepEqual(getSelectedSidebarGroupKeys(solutions, 'missing'), []);
});

test('sidebar group keys do not collide across levels', () => {
  assert.equal(
    new Set([
      getSidebarTypeKey('ABC'),
      getSidebarContestKey('abc'),
      getSidebarProblemKey('abc', 'abc'),
    ]).size,
    3
  );
});

test('buildSidebarTypeContestOptions keeps contests of the type, newest first', () => {
  assert.deepEqual(
    buildSidebarTypeContestOptions(
      ['abc100', 'abc446', 'abc_extra', 'abc420'],
      'ABC'
    ),
    [
      { contestId: 'abc446', label: '446' },
      { contestId: 'abc420', label: '420' },
      { contestId: 'abc100', label: '100' },
    ]
  );
  assert.deepEqual(
    buildSidebarTypeContestOptions(
      ['adt_all_20261030_1', 'adt_all_20261030_2', 'adt_easy_20261030_2'],
      'ADT_ALL'
    ),
    [
      { contestId: 'adt_all_20261030_2', label: '2026/10/30 #2' },
      { contestId: 'adt_all_20261030_1', label: '2026/10/30 #1' },
    ]
  );
});

test('getSidebarContestIdPrefix maps a sidebar type back to its contest ID prefix', () => {
  assert.equal(getSidebarContestIdPrefix('ABC'), 'abc');
  assert.equal(getSidebarContestIdPrefix('ADT_ALL'), 'adt_all');
});

test('filterSidebarContestOptions matches contest IDs and labels', () => {
  const options = [
    { contestId: 'adt_all_20261030_2', label: '2026/10/30 #2' },
    { contestId: 'adt_all_20261029_1', label: '2026/10/29 #1' },
  ];

  assert.deepEqual(
    filterSidebarContestOptions(options, ' 1030 ').map((option) => option.contestId),
    ['adt_all_20261030_2']
  );
  assert.deepEqual(
    filterSidebarContestOptions(options, '10/29').map((option) => option.contestId),
    ['adt_all_20261029_1']
  );
  assert.equal(filterSidebarContestOptions(options, '').length, 2);
});
