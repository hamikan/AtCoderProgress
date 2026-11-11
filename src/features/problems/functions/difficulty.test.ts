import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isCustomDifficultyTargetContest,
  resolveProblemDifficulty,
} from './difficulty';

test('isCustomDifficultyTargetContest accepts only ABC212+ and ARC104+', () => {
  assert.equal(isCustomDifficultyTargetContest('abc212'), true);
  assert.equal(isCustomDifficultyTargetContest('abc482'), true);
  assert.equal(isCustomDifficultyTargetContest('arc104'), true);
  assert.equal(isCustomDifficultyTargetContest('abc211'), false);
  assert.equal(isCustomDifficultyTargetContest('arc103'), false);
  assert.equal(isCustomDifficultyTargetContest('agc070'), false);
  assert.equal(isCustomDifficultyTargetContest('ahc069'), false);
  assert.equal(isCustomDifficultyTargetContest('abc212_a'), false);
});

test('resolveProblemDifficulty prefers the clipped custom estimate', () => {
  assert.equal(resolveProblemDifficulty(1818, 900), 1818);
  // 生値 -1000 は clipDifficulty で表示値 12 になる
  assert.equal(resolveProblemDifficulty(-1000, 100), 12);
});

test('resolveProblemDifficulty falls back to AtCoder Problems and keeps missing values empty', () => {
  assert.equal(resolveProblemDifficulty(null, 900), 900);
  assert.equal(resolveProblemDifficulty(null, null), null);
});
