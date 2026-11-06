import assert from 'node:assert/strict';
import test from 'node:test';

import { applyAtCoderIdChange } from './apply-atcoder-id-change';
import { ATCODER_ID_FETCH_INTERVAL_MS } from '@/features/auth/functions/atcoder-id-change-policy';

const NOW = new Date('2026-07-14T00:00:00.000Z');
const JUST_FETCHED = [new Date(NOW.getTime() - 60 * 1000)];

function createTransaction({
  atcoderId = 'chokudai',
  recentFetchTimes = [],
  storedAccountName = null,
}: {
  atcoderId?: string | null;
  recentFetchTimes?: Date[];
  storedAccountName?: string | null;
} = {}) {
  const calls: Array<{ name: string; args: unknown }> = [];
  const transaction = {
    user: {
      async findUnique(args: unknown) {
        calls.push({ name: 'user.findUnique', args });
        return { atcoderId };
      },
      async update(args: unknown) {
        calls.push({ name: 'user.update', args });
        return {};
      },
    },
    atCoderIdFetch: {
      async findMany(args: unknown) {
        calls.push({ name: 'atCoderIdFetch.findMany', args });
        return recentFetchTimes.map((createdAt) => ({ createdAt }));
      },
      async create(args: unknown) {
        calls.push({ name: 'atCoderIdFetch.create', args });
        return {};
      },
    },
    atCoderAccount: {
      async upsert(args: { create: { name: string } }) {
        calls.push({ name: 'atCoderAccount.upsert', args });
        return { name: storedAccountName ?? args.create.name };
      },
    },
  };

  return { calls, transaction };
}

test('marks a new AtCoder ID as fetching, records the fetch, and links it', async () => {
  const { calls, transaction } = createTransaction();

  const result = await applyAtCoderIdChange(
    transaction,
    'app-user-id',
    'TOURIST',
    NOW,
    true
  );

  assert.deepEqual(result, { status: 'changed' });
  assert.deepEqual(
    calls.map((call) => call.name),
    [
      'user.findUnique',
      'atCoderIdFetch.findMany',
      'atCoderAccount.upsert',
      'atCoderIdFetch.create',
      'user.update',
    ]
  );
  assert.deepEqual(calls[1].args, {
    where: {
      userId: 'app-user-id',
      createdAt: { gt: new Date(NOW.getTime() - ATCODER_ID_FETCH_INTERVAL_MS) },
    },
    select: { createdAt: true },
  });
  assert.deepEqual(calls[2].args, {
    where: { id: 'tourist' },
    create: { id: 'tourist', name: 'TOURIST', fetchStartedAt: NOW },
    update: { fetchStartedAt: NOW, fetchFailedAt: null },
    select: { name: true },
  });
  assert.deepEqual(calls[3].args, {
    data: { userId: 'app-user-id', atcoderAccountId: 'tourist' },
  });
  assert.deepEqual(calls[4].args, {
    data: { atcoderId: 'TOURIST', atcoderIdChangedAt: NOW },
    where: { id: 'app-user-id' },
  });
});

test('switches to a stored AtCoder ID without fetching, even right after a fetch', async () => {
  const { calls, transaction } = createTransaction({
    recentFetchTimes: JUST_FETCHED,
    storedAccountName: 'Tourist',
  });

  const result = await applyAtCoderIdChange(
    transaction,
    'app-user-id',
    'TOURIST',
    NOW,
    false
  );

  assert.deepEqual(result, { status: 'changed' });
  assert.deepEqual(
    calls.map((call) => call.name),
    [
      'user.findUnique',
      'atCoderIdFetch.findMany',
      'atCoderAccount.upsert',
      'user.update',
    ]
  );
  assert.deepEqual(calls[2].args, {
    where: { id: 'tourist' },
    create: { id: 'tourist', name: 'TOURIST', fetchStartedAt: null },
    update: {},
    select: { name: true },
  });
  assert.deepEqual(calls[3].args, {
    data: { atcoderId: 'Tourist', atcoderIdChangedAt: NOW },
    where: { id: 'app-user-id' },
  });
});

test('does not write when the AtCoder ID is unchanged', async () => {
  const { calls, transaction } = createTransaction();

  assert.deepEqual(
    await applyAtCoderIdChange(transaction, 'app-user-id', 'chokudai', NOW, true),
    { status: 'unchanged' }
  );
  assert.deepEqual(
    calls.map((call) => call.name),
    ['user.findUnique', 'atCoderIdFetch.findMany']
  );
});

test('does not start a new AtCoder ID fetch right after another one', async () => {
  const { calls, transaction } = createTransaction({
    recentFetchTimes: JUST_FETCHED,
  });

  const result = await applyAtCoderIdChange(
    transaction,
    'app-user-id',
    'tourist',
    NOW,
    true
  );

  assert.equal(result.status, 'blocked');
  assert.deepEqual(
    calls.map((call) => call.name),
    ['user.findUnique', 'atCoderIdFetch.findMany']
  );
});
