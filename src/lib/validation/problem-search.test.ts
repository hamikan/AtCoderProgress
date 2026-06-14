import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_PROBLEM_SEARCH_QUERY_LENGTH,
  normalizeProblemSearchLimit,
  normalizeProblemSearchQuery,
} from './problem-search';

test('normalizeProblemSearchQuery trims valid queries', () => {
  assert.equal(normalizeProblemSearchQuery('  abc301_d  '), 'abc301_d');
});

test('normalizeProblemSearchQuery ignores short queries', () => {
  assert.equal(normalizeProblemSearchQuery('a'), null);
  assert.equal(normalizeProblemSearchQuery('   '), null);
});

test('normalizeProblemSearchQuery rejects too long queries', () => {
  assert.throws(
    () => normalizeProblemSearchQuery('a'.repeat(MAX_PROBLEM_SEARCH_QUERY_LENGTH + 1)),
    { message: 'Search query is too long' }
  );
});

test('normalizeProblemSearchLimit clamps invalid limits', () => {
  assert.equal(normalizeProblemSearchLimit(0), 10);
  assert.equal(normalizeProblemSearchLimit(101), 10);
  assert.equal(normalizeProblemSearchLimit(20), 20);
});
