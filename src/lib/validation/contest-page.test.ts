import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_CONTEST_PAGE_SIZE,
  isContestKind,
  isContestOrder,
  parseContestPageSize,
  validateContestCursor,
} from './contest-page';

test('contest kind and order validators allow only supported values', () => {
  assert.equal(isContestKind('abc'), true);
  assert.equal(isContestKind('ABC'), false);
  assert.equal(isContestKind('bad'), false);
  assert.equal(isContestOrder('asc'), true);
  assert.equal(isContestOrder('sideways'), false);
});

test('parseContestPageSize validates bounds', () => {
  assert.equal(parseContestPageSize(null), DEFAULT_CONTEST_PAGE_SIZE);
  assert.equal(parseContestPageSize('1'), 1);
  assert.equal(parseContestPageSize('101'), null);
  assert.equal(parseContestPageSize('invalid'), null);
});

test('validateContestCursor enforces contest kind prefix', () => {
  assert.equal(validateContestCursor(null, 'abc'), true);
  assert.equal(validateContestCursor('abc001', 'abc'), true);
  assert.equal(validateContestCursor('arc001', 'abc'), false);
});
