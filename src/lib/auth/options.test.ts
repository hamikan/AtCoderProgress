import assert from 'node:assert/strict';
import test from 'node:test';

test('auth options can be imported without credentials', async () => {
  await assert.doesNotReject(() => import('./options'));
});

test('auth options require credentials when they are created', async () => {
  const { createAuthOptions } = await import('./options');

  assert.throws(
    () => createAuthOptions({}),
    { message: 'Missing required environment variable: GITHUB_ID' }
  );
});

test('auth options use the provided credentials', async () => {
  const { createAuthOptions } = await import('./options');
  const options = createAuthOptions({
    GITHUB_ID: 'github-client-id',
    GITHUB_SECRET: 'github-client-secret',
    NEXTAUTH_SECRET: 'next-auth-secret',
  });

  assert.equal(options.secret, 'next-auth-secret');
  assert.equal(options.providers.length, 1);
});
