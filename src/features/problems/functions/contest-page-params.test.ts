import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BACKGROUND_CONTEST_PAGE_SIZE,
  DEFAULT_CONTEST_PAGE_SIZE,
  INITIAL_CONTEST_PAGE_SIZE,
  MAX_CONTEST_PAGE_SIZE,
  isContestKind,
  isContestOrder,
  parseContestPageSize,
  isValidContestCursor,
} from './contest-page-params';

test('contest autoload page sizes stay within the allowed bounds', () => {
  assert.equal(INITIAL_CONTEST_PAGE_SIZE, 20);
  assert.ok(INITIAL_CONTEST_PAGE_SIZE < MAX_CONTEST_PAGE_SIZE);
  assert.equal(BACKGROUND_CONTEST_PAGE_SIZE, MAX_CONTEST_PAGE_SIZE);
  assert.equal(parseContestPageSize(String(BACKGROUND_CONTEST_PAGE_SIZE)), BACKGROUND_CONTEST_PAGE_SIZE);
});

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

test('isValidContestCursor enforces contest kind prefix', () => {
  assert.equal(isValidContestCursor(null, 'abc'), true);
  assert.equal(isValidContestCursor('abc001', 'abc'), true);
  assert.equal(isValidContestCursor('arc001', 'abc'), false);
});
