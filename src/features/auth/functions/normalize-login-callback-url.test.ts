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

test('normalizeLoginCallbackUrl keeps the path of a same-origin absolute URL', () => {
  assert.equal(
    normalizeLoginCallbackUrl(
      'http://localhost:1207/solutions/new?problemId=abc001_a',
      'http://localhost:1207'
    ),
    '/solutions/new?problemId=abc001_a'
  );
  // NEXTAUTH_URL may carry a trailing slash; only its origin is compared.
  assert.equal(
    normalizeLoginCallbackUrl(
      'https://app.example.com/problems/list',
      'https://app.example.com/'
    ),
    '/problems/list'
  );
});

test('normalizeLoginCallbackUrl rejects absolute URLs from another origin', () => {
  assert.equal(
    normalizeLoginCallbackUrl('https://example.com/solutions', 'https://app.example.com'),
    '/dashboard'
  );
  // Without an app origin to compare against, absolute URLs stay rejected.
  assert.equal(normalizeLoginCallbackUrl('https://app.example.com/solutions'), '/dashboard');
});
