import assert from 'node:assert/strict';
import test from 'node:test';

import { isActiveNavLink } from './is-active-nav-link';

test('isActiveNavLink matches the exact path', () => {
  assert.equal(isActiveNavLink('/dashboard', '/dashboard'), true);
});

test('isActiveNavLink matches nested paths under the href', () => {
  assert.equal(isActiveNavLink('/solutions/abc123', '/solutions'), true);
});

test('isActiveNavLink does not match a sibling that only shares a prefix', () => {
  assert.equal(isActiveNavLink('/solutions-archive', '/solutions'), false);
});

test('isActiveNavLink does not match unrelated paths', () => {
  assert.equal(isActiveNavLink('/analytics', '/dashboard'), false);
});

test('isActiveNavLink honors additional active paths', () => {
  assert.equal(isActiveNavLink('/problems/list', '/problems/contest', ['/problems/list']), true);
  assert.equal(isActiveNavLink('/problems/list/1', '/problems/contest', ['/problems/list']), true);
  assert.equal(isActiveNavLink('/problems/list', '/problems/contest'), false);
});
