import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeLoginCallbackUrl } from './normalize-login-callback-url';

test('normalizeLoginCallbackUrl keeps an internal path and query', () => {
  assert.equal(
    normalizeLoginCallbackUrl('/solutions/new?problemId=abc001_a'),
    '/solutions/new?problemId=abc001_a'
  );
});

test('normalizeLoginCallbackUrl uses the dashboard when the value is absent', () => {
  assert.equal(normalizeLoginCallbackUrl(undefined), '/dashboard');
});

test('normalizeLoginCallbackUrl rejects absolute and protocol-relative URLs', () => {
  assert.equal(normalizeLoginCallbackUrl('https://example.com'), '/dashboard');
  assert.equal(normalizeLoginCallbackUrl('//example.com/path'), '/dashboard');
});
