import assert from 'node:assert/strict';
import test from 'node:test';

import { mergedProblemsSchema, problemModelsSchema } from '@/lib/atcoder/contests/schemas';
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

test('normalizeContestData prefers the custom estimate for ABC212+/ARC104+ problems', () => {
  const normalized = normalizeContestData({
    contests: [],
    mergedProblems: [
      {
        id: 'arc230_a',
        name: 'A',
        contest_id: 'arc230',
        first_contest_id: 'arc230',
      },
      {
        id: 'abc214_a',
        name: 'A',
        contest_id: 'abc214',
        first_contest_id: 'abc214',
      },
    ],
    contestProblems: [],
    problemModels: {
      arc230_a: { difficulty: 900 },
      abc214_a: { difficulty: 100 },
    },
  });

  // 独自推定（irt5_time）の生値 1818 が使われる
  assert.equal(normalized.problems[0].difficulty, 1818);
  // 生値 -1000 は clipDifficulty で表示値 12 になる
  assert.equal(normalized.problems[1].difficulty, 12);
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

test('normalizeContestData accepts nullable API fields and preserves unknown difficulty', () => {
  const mergedProblems = mergedProblemsSchema.parse(
    ['abc049_a', 'abc049_b', 'abc049_c', 'arc230_a'].map((id) => ({
      id,
      name: id,
      contest_id: id.split('_')[0],
      first_contest_id: null,
    }))
  );
  const problemModels = problemModelsSchema.parse({
    abc049_a: {},
    abc049_b: { difficulty: null },
  });
  const normalized = normalizeContestData({
    contests: [], contestProblems: [], mergedProblems, problemModels,
  });

  assert.deepEqual(
    normalized.problems.map(({ id, firstContestId, difficulty }) => [id, firstContestId, difficulty]),
    [
      ['abc049_a', 'abc049', null],
      ['abc049_b', 'abc049', null],
      ['abc049_c', 'abc049', null],
      ['arc230_a', 'arc230', 1818],
    ]
  );
  assert.equal(mergedProblemsSchema.safeParse([
    { id: 'a', name: 'A', contest_id: 'abc049', first_contest_id: 123 },
  ]).success, false);
  assert.equal(problemModelsSchema.safeParse({ a: { difficulty: 'unknown' } }).success, false);
});
