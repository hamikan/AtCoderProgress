import assert from 'node:assert/strict';
import test from 'node:test';

import { getSiteUrl } from './site-url';

test('getSiteUrl prefers NEXTAUTH_URL when it is a valid absolute URL', () => {
  const url = getSiteUrl({
    NEXTAUTH_URL: 'https://example.com',
    VERCEL_PROJECT_PRODUCTION_URL: 'example.vercel.app',
  });
  assert.equal(url?.origin, 'https://example.com');
});

test('getSiteUrl falls back to the Vercel production URL', () => {
  assert.equal(
    getSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'example.vercel.app' })?.origin,
    'https://example.vercel.app'
  );
  assert.equal(
    getSiteUrl({
      NEXTAUTH_URL: 'not a url',
      VERCEL_PROJECT_PRODUCTION_URL: 'example.vercel.app',
    })?.origin,
    'https://example.vercel.app'
  );
});

test('getSiteUrl returns undefined when nothing usable is set', () => {
  assert.equal(getSiteUrl({}), undefined);
  assert.equal(getSiteUrl({ NEXTAUTH_URL: '/relative' }), undefined);
});
