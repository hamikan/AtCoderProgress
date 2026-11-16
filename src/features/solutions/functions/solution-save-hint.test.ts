import assert from 'node:assert/strict';
import test from 'node:test';

import { getSolutionSaveHint } from './solution-save-hint';

test('getSolutionSaveHint explains why nothing is being saved yet', () => {
  assert.equal(
    getSolutionSaveHint({ isAuthenticated: false, hasProblemAndContest: true, hasCurrentContest: true }),
    'ログインすると、記録を保存できます。'
  );
  assert.equal(
    getSolutionSaveHint({ isAuthenticated: true, hasProblemAndContest: false, hasCurrentContest: false }),
    '問題とコンテストを選ぶと、保存されます。'
  );
  assert.equal(
    getSolutionSaveHint({ isAuthenticated: true, hasProblemAndContest: true, hasCurrentContest: false }),
    'この問題が入っているコンテストを選んでください。'
  );
  assert.equal(
    getSolutionSaveHint({ isAuthenticated: true, hasProblemAndContest: true, hasCurrentContest: true }),
    null
  );
});
