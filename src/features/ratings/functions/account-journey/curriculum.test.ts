import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCurriculumSections,
  buildFirstAcceptedByProblem,
} from './curriculum';
import type {
  CurriculumRow,
  RatingHistoryRow,
  SubmissionRow,
} from '@/features/ratings/types';

const RATING_HISTORY: RatingHistoryRow[] = [
  {
    oldRating: 300,
    newRating: 500,
    performance: 700,
    contestName: 'Contest',
    contestScreenName: 'abc001.contest.atcoder.jp',
    endTime: new Date('2026-01-02T00:00:00.000Z'),
  },
];

const SUBMISSIONS: SubmissionRow[] = [
  {
    problemId: 'abs_a',
    contestId: 'abs',
    result: 'WA',
    epochSecond: 1_767_225_500,
    problem: { id: 'abs_a', name: 'PracticeA', difficulty: 100 },
  },
  {
    problemId: 'abs_a',
    contestId: 'abs',
    result: 'AC',
    epochSecond: 1_767_225_600,
    problem: { id: 'abs_a', name: 'PracticeA', difficulty: 100 },
  },
  {
    problemId: 'abs_a',
    contestId: 'abs',
    result: 'AC',
    epochSecond: 1_767_225_700,
    problem: { id: 'abs_a', name: 'PracticeA', difficulty: 100 },
  },
];

function row(
  contestId: string,
  problemIndex: string,
  name: string = problemIndex
): CurriculumRow {
  return {
    contestId,
    problemId: `${contestId}_${problemIndex.toLowerCase()}`,
    problemIndex,
    problem: { name, difficulty: 100 },
  };
}

test('buildFirstAcceptedByProblem keeps only the first AC', () => {
  const accepted = buildFirstAcceptedByProblem(SUBMISSIONS);

  assert.equal(accepted.size, 1);
  assert.equal(accepted.get('abs_a')?.epochSecond, 1_767_225_600);
});

test('buildCurriculumSections builds each supported curriculum grouping', () => {
  const rows = [
    row('abs', 'A', 'PracticeA'),
    row('dp', 'A'),
    row('tdpc', 'A'),
    row('ndpc', 'A'),
    row('typical90', '001', 'Easy ★2'),
    row('typical90', '002', 'Unknown'),
    row('math-and-algorithm', '001'),
    row('math-and-algorithm', '021'),
    row('tessoku-book', 'A01'),
    row('tessoku-book', 'B01'),
    row('joi2025yo1a', 'A'),
    row('joi2025ho', 'B'),
    row('joisc2025', 'C'),
    row('joi2025final', 'D'),
  ];
  const accepted = buildFirstAcceptedByProblem(SUBMISSIONS);

  const sections = buildCurriculumSections(rows, accepted, RATING_HISTORY);

  assert.deepEqual(
    sections.map((section) => section.key),
    [
      'abs',
      'edpc-core',
      'tdpc',
      'ndpc',
      'typical90',
      'math-and-algorithm',
      'tessoku-book',
      'joi',
    ]
  );
  assert.equal(sections[0].solved, 1);
  assert.equal(sections[4].groups[0].label, '★2');
  assert.deepEqual(
    sections[5].groups.map((group) => group.label),
    ['001-020', '021-040']
  );
  assert.deepEqual(
    sections[7].groups.map((group) => group.key),
    ['joi-yo', 'joi-ho', 'joi-sc', 'joi-other']
  );
});
