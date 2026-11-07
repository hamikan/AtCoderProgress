import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatSolutionRecordLabel,
  getDefaultContestId,
  getSolutionEditorKey,
  hasUnsavedScopeMove,
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
  assert.equal(formatSolutionRecordLabel({ title: '  ' }, 1), '記録 2');
  assert.equal(formatSolutionRecordLabel({ title: null }, 2), '記録 3');
  assert.equal(formatSolutionRecordLabel({ title: ' 別解 ' }, 0), '別解');
});

test('hasUnsavedScopeMove detects a problem or contest change', () => {
  const saved = { problemId: 'abc001_a', contestId: 'abc001' };
  assert.equal(hasUnsavedScopeMove(saved, { ...saved }), false);
  assert.equal(
    hasUnsavedScopeMove(saved, { problemId: 'abc001_b', contestId: 'abc001' }),
    true
  );
  assert.equal(
    hasUnsavedScopeMove(saved, { problemId: 'abc001_a', contestId: 'arc001' }),
    true
  );
  assert.equal(hasUnsavedScopeMove(null, { ...saved }), false);
  assert.equal(hasUnsavedScopeMove(saved, null), false);
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
