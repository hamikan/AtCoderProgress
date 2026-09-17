import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatSolutionRecordLabel,
  getDefaultContestId,
  getSolutionEditorKey,
} from './solution-editor';
import type { ProblemDetail } from '@/features/problems/types';

const PROBLEM: ProblemDetail = {
  id: 'abc001_a',
  name: 'A',
  difficulty: 100,
  firstContest: { id: 'abc001' },
  problemIndex: 'A',
  contests: [
    { contestId: 'abc001', problemIndex: 'A' },
    { contestId: 'practice', problemIndex: 'A' },
  ],
};

test('getDefaultContestId prefers a valid requested contest', () => {
  assert.equal(getDefaultContestId(PROBLEM, 'practice'), 'practice');
  assert.equal(getDefaultContestId(PROBLEM, 'missing'), 'abc001');
  assert.equal(getDefaultContestId(null, 'abc001'), null);
});

test('formatSolutionRecordLabel falls back to a numbered label', () => {
  assert.equal(
    formatSolutionRecordLabel({
      id: 'solution-1',
      contestId: 'abc001',
      title: '  ',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      status: 'AC',
    }, 1),
    '記録 2'
  );
});

test('getSolutionEditorKey identifies the editable record scope', () => {
  assert.equal(
    getSolutionEditorKey({
      solutionId: 'solution-1',
      problemId: 'abc001_a',
      contestId: 'abc001',
    }),
    'solution-1:abc001_a:abc001'
  );
});
