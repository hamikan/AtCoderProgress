import assert from 'node:assert/strict';
import test from 'node:test';

import { getRequiredAuthEnvironmentVariable } from './environment';

test('getRequiredAuthEnvironmentVariable returns a configured value unchanged', () => {
  const environment = { GITHUB_ID: 'github-client-id' };

  assert.equal(
    getRequiredAuthEnvironmentVariable('GITHUB_ID', environment),
    'github-client-id'
  );
});

test('getRequiredAuthEnvironmentVariable rejects missing and blank values', () => {
  for (const value of [undefined, '', '   ']) {
    assert.throws(
      () => getRequiredAuthEnvironmentVariable('GITHUB_SECRET', { GITHUB_SECRET: value }),
      { message: 'Missing required environment variable: GITHUB_SECRET' }
    );
  }
});

test('getRequiredAuthEnvironmentVariable does not expose configured secrets in errors', () => {
  const configuredSecret = 'do-not-log-this-value';

  assert.throws(
    () =>
      getRequiredAuthEnvironmentVariable('GITHUB_SECRET', {
        NEXTAUTH_SECRET: configuredSecret,
      }),
    (error) => {
      assert.ok(error instanceof Error);
      assert.equal(
        error.message,
        'Missing required environment variable: GITHUB_SECRET'
      );
      assert.equal(error.message.includes(configuredSecret), false);
      return true;
    }
  );
});
