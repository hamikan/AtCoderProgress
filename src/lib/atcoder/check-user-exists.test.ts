import assert from 'node:assert/strict';
import test from 'node:test';

import { checkAtCoderUserExists } from './check-user-exists';

function fetchWithStatus(status: number) {
  return async () => ({ status });
}

test('checkAtCoderUserExists maps the profile page status', async () => {
  assert.equal(
    await checkAtCoderUserExists('tourist', fetchWithStatus(200)),
    'exists'
  );
  assert.equal(
    await checkAtCoderUserExists('no-such-user', fetchWithStatus(404)),
    'not-found'
  );
});

test('checkAtCoderUserExists never guesses on throttling or server errors', async () => {
  assert.equal(
    await checkAtCoderUserExists('tourist', fetchWithStatus(429)),
    'unknown'
  );
  assert.equal(
    await checkAtCoderUserExists('tourist', fetchWithStatus(503)),
    'unknown'
  );
});

test('checkAtCoderUserExists reports unknown when the request fails', async () => {
  const failingFetch = async () => {
    throw new Error('network down');
  };

  assert.equal(await checkAtCoderUserExists('tourist', failingFetch), 'unknown');
});

test('checkAtCoderUserExists requests the encoded profile URL once', async () => {
  const urls: string[] = [];
  const recordingFetch = async (url: string) => {
    urls.push(url);
    return { status: 200 };
  };

  await checkAtCoderUserExists('some user', recordingFetch);

  assert.deepEqual(urls, ['https://atcoder.jp/users/some%20user']);
});
