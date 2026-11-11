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
      // 独自推定はデータベースから取り込み時に当てるので、ここでは使わない
      ['arc230_a', 'arc230', null],
    ]
  );
  assert.equal(mergedProblemsSchema.safeParse([
    { id: 'a', name: 'A', contest_id: 'abc049', first_contest_id: 123 },
  ]).success, false);
  assert.equal(problemModelsSchema.safeParse({ a: { difficulty: 'unknown' } }).success, false);
});

test('normalizeContestData adds the supplemental problems AtCoder Problems does not list', () => {
  const normalized = normalizeContestData({
    contests: [{ id: 'APG4bPython', start_epoch_second: 0, duration_second: 0 }],
    mergedProblems: [
      {
        id: 'APG4bPython_ci',
        name: '隣り合う同じ値を探す',
        contest_id: 'APG4bPython',
        first_contest_id: 'APG4bPython',
      },
    ],
    contestProblems: [],
    problemModels: {},
  });

  assert.deepEqual(
    normalized.problems.find((problem) => problem.id === 'APG4bPython_cd'),
    { id: 'APG4bPython_cd', name: '計算量の見積もり', difficulty: null, firstContestId: 'APG4bPython' }
  );
  assert.deepEqual(
    normalized.contestProblems.find((link) => link.problemId === 'APG4bPython_cd'),
    { contestId: 'APG4bPython', problemId: 'APG4bPython_cd', problemIndex: 'EX19' }
  );
  assert.equal(
    normalized.problems.filter((problem) => problem.id === 'APG4bPython_ci').length,
    1
  );
  assert.equal(
    normalized.contestProblems.some((link) => link.problemId === 'APG4bPython_ci'),
    false
  );
});

test('normalizeContestData skips supplemental problems whose contest is not listed', () => {
  const normalized = normalizeContestData({
    contests: [],
    mergedProblems: [],
    contestProblems: [],
    problemModels: {},
  });

  assert.equal(normalized.problems.length, 0);
  assert.equal(normalized.contestProblems.length, 0);
});
