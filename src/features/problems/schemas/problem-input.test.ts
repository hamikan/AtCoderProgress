import assert from 'node:assert/strict';
import test from 'node:test';

import {
  contestKindSchema,
  contestOrderSchema,
  problemFilterTagSchema,
  problemSearchQuerySchema,
} from './problem-input';

test('contest schemas accept only supported normalized values', () => {
  assert.equal(contestKindSchema.parse('abc'), 'abc');
  assert.equal(contestOrderSchema.parse('desc'), 'desc');
  assert.equal(contestKindSchema.safeParse('ABC').success, false);
  assert.equal(contestOrderSchema.safeParse('sideways').success, false);
});

test('problem input schemas enforce query and tag boundaries', () => {
  assert.equal(problemSearchQuerySchema.parse('abc301_d'), 'abc301_d');
  assert.equal(problemSearchQuerySchema.safeParse('a').success, false);
  assert.equal(problemSearchQuerySchema.safeParse('a'.repeat(81)).success, false);
  assert.equal(problemFilterTagSchema.parse('dynamic programming'), 'dynamic programming');
  assert.equal(problemFilterTagSchema.safeParse('a'.repeat(51)).success, false);
});
