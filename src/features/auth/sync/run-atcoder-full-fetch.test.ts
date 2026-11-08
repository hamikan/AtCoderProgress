import assert from 'node:assert/strict';
import test from 'node:test';

import { finishAtCoderFullFetch } from './run-atcoder-full-fetch';
import type { AtCoderProfileData } from '@/features/auth/types';

const NOW = new Date('2026-11-07T00:00:00.000Z');
const SUBMISSION = {
  id: 1,
  epoch_second: 1,
  problem_id: 'abc001_a',
  contest_id: 'abc001',
  user_id: 'Tourist',
  language: 'C++',
  point: 100,
  length: 100,
  result: 'AC',
  execution_time: 1,
};

function createTransaction() {
  const calls: Array<{ name: string; args: unknown }> = [];
  const transaction = {
    problem: {
      async findMany() {
        return [{ id: 'abc001_a' }];
      },
    },
    submission: {
      async findMany() {
        return [];
      },
      async createMany(args: unknown) {
        calls.push({ name: 'submission.createMany', args });
        return {};
      },
      async update() {
        return {};
      },
    },
    pendingSubmission: {
      async findMany() {
        return [];
      },
      async createMany(args: unknown) {
        calls.push({ name: 'pendingSubmission.createMany', args });
        return {};
      },
      async deleteMany() {
        return {};
      },
    },
    userRatingHistory: {
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

test('stores the fetched data, clears the fetching mark, and uses the AtCoder spelling', async () => {
  const { calls, transaction } = createTransaction();
  const profileData: AtCoderProfileData = {
    submissionData: { submissions: [SUBMISSION] },
    ratingHistory: [],
  };

  await finishAtCoderFullFetch(transaction, 'tourist', profileData, NOW);

  assert.deepEqual(
    calls.map((call) => call.name),
    ['submission.createMany', 'atCoderAccount.update', 'user.updateMany']
  );
  assert.deepEqual(calls[1].args, {
    where: { id: 'tourist' },
    data: {
      name: 'Tourist',
      submissionsLastFetchedAt: NOW,
      fetchStartedAt: null,
      fetchFailedAt: null,
    },
  });
  assert.deepEqual(calls[2].args, {
    where: { atcoderId: { equals: 'tourist', mode: 'insensitive' } },
    data: { atcoderId: 'Tourist' },
  });
});

test('keeps names as they are when no submission tells the AtCoder spelling', async () => {
  const { calls, transaction } = createTransaction();

  await finishAtCoderFullFetch(
    transaction,
    'tourist',
    { submissionData: { submissions: [] }, ratingHistory: [] },
    NOW
  );

  assert.deepEqual(calls.map((call) => call.name), ['atCoderAccount.update']);
  assert.deepEqual(calls[0].args, {
    where: { id: 'tourist' },
    data: { submissionsLastFetchedAt: NOW, fetchStartedAt: null, fetchFailedAt: null },
  });
});
