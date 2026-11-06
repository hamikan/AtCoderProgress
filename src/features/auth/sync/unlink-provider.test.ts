import assert from 'node:assert/strict';
import test from 'node:test';

import { unlinkProvider } from './unlink-provider';

function createTransaction({ providers = ['google', 'github'] }: { providers?: string[] } = {}) {
  const calls: Array<{ name: string; args: unknown }> = [];
  const transaction = {
    account: {
      async findMany(args: unknown) {
        calls.push({ name: 'account.findMany', args });
        return providers.map((provider) => ({ provider }));
      },
      async deleteMany(args: unknown) {
        calls.push({ name: 'account.deleteMany', args });
        return { count: 1 };
      },
    },
  };

  return { calls, transaction };
}

test('unlinks the provider when another one remains', async () => {
  const { calls, transaction } = createTransaction();

  const result = await unlinkProvider(transaction, 'user-id', 'google');

  assert.deepEqual(result, { status: 'unlinked' });
  assert.deepEqual(calls, [
    {
      name: 'account.findMany',
      args: { select: { provider: true }, where: { userId: 'user-id' } },
    },
    {
      name: 'account.deleteMany',
      args: { where: { provider: 'google', userId: 'user-id' } },
    },
  ]);
});

test('refuses to unlink the last remaining provider', async () => {
  const { calls, transaction } = createTransaction({ providers: ['github'] });

  const result = await unlinkProvider(transaction, 'user-id', 'github');

  assert.deepEqual(result, { status: 'last-provider' });
  assert.equal(calls.length, 1);
});

test('reports not-linked when the provider is not linked', async () => {
  const { calls, transaction } = createTransaction({ providers: ['github'] });

  const result = await unlinkProvider(transaction, 'user-id', 'google');

  assert.deepEqual(result, { status: 'not-linked' });
  assert.equal(calls.length, 1);
});
