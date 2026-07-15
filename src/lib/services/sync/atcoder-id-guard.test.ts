import assert from 'node:assert/strict';
import test from 'node:test';

import { isCurrentAtCoderId } from './atcoder-id-guard';

test('allows persistence only for the user current AtCoder ID', async () => {
  const transaction = {
    user: {
      async findUnique() {
        return { atcoderId: 'tourist' };
      },
    },
  };

  assert.equal(
    await isCurrentAtCoderId(transaction, 'app-user-id', 'tourist'),
    true
  );
  assert.equal(
    await isCurrentAtCoderId(transaction, 'app-user-id', 'chokudai'),
    false
  );
});

test('rejects persistence when the app user no longer exists', async () => {
  const transaction = {
    user: {
      async findUnique() {
        return null;
      },
    },
  };

  assert.equal(
    await isCurrentAtCoderId(transaction, 'missing-user', 'tourist'),
    false
  );
});
