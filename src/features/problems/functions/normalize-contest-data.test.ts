import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeContestData } from './normalize-contest-data';

test('normalizeContestData converts provider fields and clips low difficulty', () => {
  const normalized = normalizeContestData({
    contests: [
      { id: 'abc001', start_epoch_second: 100, duration_second: 7200 },
    ],
    mergedProblems: [
      {
        id: 'abc001_a',
        name: 'A',
        contest_id: 'abc001',
        first_contest_id: '',
      },
      {
        id: 'abc001_b',
        name: 'B',
        contest_id: 'abc001',
        first_contest_id: 'practice',
      },
    ],
    contestProblems: [
      { contest_id: 'abc001', problem_id: 'abc001_a', problem_index: 'A' },
    ],
    problemModels: {
      abc001_a: { difficulty: 0 },
      abc001_b: { difficulty: 500 },
    },
  });

  assert.equal(normalized.problems[0].firstContestId, 'abc001');
  assert.equal(normalized.problems[0].difficulty, 147);
  assert.equal(normalized.problems[1].firstContestId, 'practice');
  assert.equal(normalized.problems[1].difficulty, 500);
  assert.deepEqual(normalized.contestProblems[0], {
    contestId: 'abc001',
    problemId: 'abc001_a',
    problemIndex: 'A',
  });
});

test('normalizeContestData preserves missing difficulty', () => {
  const normalized = normalizeContestData({
    contests: [],
    mergedProblems: [
      {
        id: 'abc001_a',
        name: 'A',
        contest_id: 'abc001',
        first_contest_id: 'abc001',
      },
    ],
    contestProblems: [],
    problemModels: { abc001_a: { difficulty: null } },
  });

  assert.equal(normalized.problems[0].difficulty, null);
});
