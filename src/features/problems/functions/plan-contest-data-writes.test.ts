import assert from 'node:assert/strict';
import test from 'node:test';

import type { StoredContestData } from '@/features/problems/types/input/contest-data-write-plan';
import type { NormalizedContestData } from '@/features/problems/types/input/normalized-contest-data';

import { planContestDataWrites } from './plan-contest-data-writes';

const STORED: StoredContestData = {
  contests: [{ id: 'abc001', startEpochSecond: 100, durationSecond: 6000 }],
  problems: [
    { id: 'abc001_a', name: 'A', difficulty: 50, customDifficulty: null, firstContestId: 'abc001' },
    { id: 'abc001_b', name: 'B', difficulty: 12, customDifficulty: -1000, firstContestId: 'abc001' },
  ],
  contestProblems: [
    { contestId: 'abc001', problemId: 'abc001_a', problemIndex: 'A' },
    { contestId: 'abc001', problemId: 'abc001_b', problemIndex: 'B' },
  ],
};

const SAME_AS_STORED: NormalizedContestData = {
  contests: STORED.contests,
  problems: [
    { id: 'abc001_a', name: 'A', difficulty: 50, firstContestId: 'abc001' },
    { id: 'abc001_b', name: 'B', difficulty: 300, firstContestId: 'abc001' },
  ],
  contestProblems: STORED.contestProblems,
};

test('planContestDataWrites writes nothing when nothing changed', () => {
  const plan = planContestDataWrites(STORED, SAME_AS_STORED);

  assert.deepEqual(plan, {
    contestsToCreate: [],
    contestsToUpdate: [],
    problemsToCreate: [],
    problemsToUpdate: [],
    contestProblemsToCreate: [],
    contestProblemsToUpdate: [],
    skippedProblemCount: 0,
    skippedContestProblemCount: 0,
  });
});

test('planContestDataWrites adds new rows and updates only changed ones', () => {
  const plan = planContestDataWrites(STORED, {
    contests: [
      { id: 'abc001', startEpochSecond: 100, durationSecond: 7200 },
      { id: 'abc002', startEpochSecond: 200, durationSecond: 6000 },
    ],
    problems: [
      { id: 'abc001_a', name: 'A (renamed)', difficulty: 50, firstContestId: 'abc001' },
      { id: 'abc001_b', name: 'B', difficulty: 300, firstContestId: 'abc001' },
      { id: 'abc002_a', name: 'New', difficulty: null, firstContestId: 'abc002' },
    ],
    contestProblems: [
      { contestId: 'abc001', problemId: 'abc001_a', problemIndex: 'A' },
      { contestId: 'abc001', problemId: 'abc001_b', problemIndex: 'Ex' },
      { contestId: 'abc002', problemId: 'abc002_a', problemIndex: 'A' },
    ],
  });

  assert.deepEqual(plan.contestsToCreate, [{ id: 'abc002', startEpochSecond: 200, durationSecond: 6000 }]);
  assert.deepEqual(plan.contestsToUpdate, [{ id: 'abc001', startEpochSecond: 100, durationSecond: 7200 }]);
  assert.deepEqual(plan.problemsToCreate, [
    { id: 'abc002_a', name: 'New', difficulty: null, firstContestId: 'abc002' },
  ]);
  assert.deepEqual(plan.problemsToUpdate, [
    { id: 'abc001_a', name: 'A (renamed)', difficulty: 50, firstContestId: 'abc001' },
  ]);
  assert.deepEqual(plan.contestProblemsToCreate, [
    { contestId: 'abc002', problemId: 'abc002_a', problemIndex: 'A' },
  ]);
  assert.deepEqual(plan.contestProblemsToUpdate, [
    { contestId: 'abc001', problemId: 'abc001_b', problemIndex: 'Ex' },
  ]);
});

test('planContestDataWrites keeps the stored difficulty when the import has none', () => {
  const plan = planContestDataWrites(STORED, {
    ...SAME_AS_STORED,
    problems: [
      { id: 'abc001_a', name: 'A', difficulty: null, firstContestId: 'abc001' },
      { id: 'abc001_b', name: 'B', difficulty: null, firstContestId: 'abc001' },
    ],
  });

  assert.deepEqual(plan.problemsToUpdate, []);
});

test('planContestDataWrites takes a difficulty that arrives later', () => {
  const stored: StoredContestData = {
    ...STORED,
    problems: [{ id: 'abc001_a', name: 'A', difficulty: null, customDifficulty: null, firstContestId: 'abc001' }],
  };
  const plan = planContestDataWrites(stored, {
    ...SAME_AS_STORED,
    problems: [{ id: 'abc001_a', name: 'A', difficulty: 420, firstContestId: 'abc001' }],
  });

  assert.deepEqual(plan.problemsToUpdate, [
    { id: 'abc001_a', name: 'A', difficulty: 420, firstContestId: 'abc001' },
  ]);
});

test('planContestDataWrites never deletes rows missing from the import', () => {
  const plan = planContestDataWrites(STORED, { contests: [], problems: [], contestProblems: [] });

  assert.deepEqual(
    [plan.contestsToUpdate, plan.problemsToUpdate, plan.contestProblemsToUpdate],
    [[], [], []]
  );
});

test('planContestDataWrites skips rows whose contest or problem is unknown', () => {
  const plan = planContestDataWrites(STORED, {
    contests: [],
    problems: [{ id: 'xyz_a', name: 'Orphan', difficulty: 100, firstContestId: 'xyz' }],
    contestProblems: [
      { contestId: 'abc001', problemId: 'xyz_a', problemIndex: 'A' },
      { contestId: 'xyz', problemId: 'abc001_a', problemIndex: 'A' },
    ],
  });

  assert.deepEqual(plan.problemsToCreate, []);
  assert.deepEqual(plan.contestProblemsToCreate, []);
  assert.equal(plan.skippedProblemCount, 1);
  assert.equal(plan.skippedContestProblemCount, 2);
});
