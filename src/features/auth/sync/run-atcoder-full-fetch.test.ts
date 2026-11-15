import assert from 'node:assert/strict';
import test from 'node:test';

import { finishAtCoderFullFetch } from './run-atcoder-full-fetch';

const NOW = new Date('2026-11-07T00:00:00.000Z');

function createTransaction() {
  const calls: Array<{ name: string; args: unknown }> = [];
  const transaction = {
    userRatingHistory: {
      async findMany() {
        return [];
      },
      async update() {
        return {};
      },
      async createMany(args: unknown) {
        calls.push({ name: 'userRatingHistory.createMany', args });
        return {};
      },
    },
    atCoderAccount: {
      async update(args: unknown) {
        calls.push({ name: 'atCoderAccount.update', args });
        return {};
      },
    },
    user: {
      async updateMany(args: unknown) {
        calls.push({ name: 'user.updateMany', args });
        return {};
      },
    },
  };
  return { calls, transaction };
}

test('clears the fetching mark and uses the AtCoder spelling', async () => {
  const { calls, transaction } = createTransaction();

  await finishAtCoderFullFetch(
    transaction,
    'tourist',
    { ratingHistory: [], canonicalName: 'Tourist' },
    NOW
  );

  assert.deepEqual(
    calls.map((call) => call.name),
    ['atCoderAccount.update', 'user.updateMany']
  );
  assert.deepEqual(calls[0].args, {
    where: { id: 'tourist' },
    data: {
      name: 'Tourist',
      submissionsLastFetchedAt: NOW,
      fetchStartedAt: null,
      fetchFailedAt: null,
    },
  });
  assert.deepEqual(calls[1].args, {
    where: { atcoderId: { equals: 'tourist', mode: 'insensitive' } },
    data: { atcoderId: 'Tourist' },
  });
});

test('keeps names as they are when no submission tells the AtCoder spelling', async () => {
  const { calls, transaction } = createTransaction();

  await finishAtCoderFullFetch(
    transaction,
    'tourist',
    { ratingHistory: [], canonicalName: null },
    NOW
  );

  assert.deepEqual(calls.map((call) => call.name), ['atCoderAccount.update']);
  assert.deepEqual(calls[0].args, {
    where: { id: 'tourist' },
    data: { submissionsLastFetchedAt: NOW, fetchStartedAt: null, fetchFailedAt: null },
  });
});
