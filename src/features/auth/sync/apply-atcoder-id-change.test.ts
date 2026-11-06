import assert from 'node:assert/strict';
import test from 'node:test';

import { applyAtCoderIdChange } from './apply-atcoder-id-change';
import type { AtCoderProfileData } from '@/features/auth/types';

const NOW = new Date('2026-07-14T00:00:00.000Z');
const PROFILE_DATA: AtCoderProfileData = {
  submissionData: {
    submissions: [
      {
        id: 1,
        epoch_second: 1,
        problem_id: 'abc001_a',
        contest_id: 'abc001',
        user_id: 'tourist',
        language: 'C++',
        point: 100,
        length: 100,
        result: 'AC',
        execution_time: 1,
      },
    ],
  },
  ratingHistory: [
    {
      IsRated: true,
      Place: 1,
      OldRating: 3800,
      NewRating: 3900,
      Performance: 4000,
      InnerPerformance: 4000,
      ContestScreenName: 'abc001.contest.atcoder.jp',
      ContestName: 'AtCoder Beginner Contest 001',
      ContestNameEn: 'AtCoder Beginner Contest 001',
      EndTime: '2026-07-13T00:00:00.000Z',
    },
  ],
};

function createTransaction(
  user: {
    atcoderId: string | null;
    atcoderIdChangedAt: Date | null;
  },
  storedAccountName: string | null = null
) {
  const calls: Array<{ name: string; args: unknown }> = [];
  const transaction = {
    user: {
      async findUnique(args: unknown) {
        calls.push({ name: 'user.findUnique', args });
        return user;
      },
      async update(args: unknown) {
        calls.push({ name: 'user.update', args });
        return user;
      },
    },
    atCoderAccount: {
      async upsert(args: { create: { name: string } }) {
        calls.push({ name: 'atCoderAccount.upsert', args });
        return { name: storedAccountName ?? args.create.name };
      },
    },
    submission: {
      async findMany(args: unknown) {
        calls.push({ name: 'submission.findMany', args });
        return [];
      },
      async createMany(args: unknown) {
        calls.push({ name: 'submission.createMany', args });
        return { count: 1 };
      },
      async update(args: unknown) {
        calls.push({ name: 'submission.update', args });
        return {};
      },
    },
    userRatingHistory: {
      async createMany(args: unknown) {
        calls.push({ name: 'userRatingHistory.createMany', args });
        return { count: 1 };
      },
    },
    problem: {
      async findMany(args: unknown) {
        calls.push({ name: 'problem.findMany', args });
        return [{ id: 'abc001_a' }];
      },
    },
  };

  return { calls, transaction };
}

test('stores fetched data under the new AtCoder ID and links it without deleting anything', async () => {
  const { calls, transaction } = createTransaction({
    atcoderId: 'chokudai',
    atcoderIdChangedAt: new Date('2026-07-01T00:00:00.000Z'),
  });

  const result = await applyAtCoderIdChange(
    transaction,
    'app-user-id',
    'TOURIST',
    NOW,
    PROFILE_DATA
  );

  assert.deepEqual(result, { status: 'changed' });
  assert.deepEqual(
    calls.map((call) => call.name),
    [
      'user.findUnique',
      'atCoderAccount.upsert',
      'problem.findMany',
      'submission.findMany',
      'submission.createMany',
      'userRatingHistory.createMany',
      'user.update',
    ]
  );
  assert.deepEqual(calls[1].args, {
    where: { id: 'tourist' },
    create: {
      id: 'tourist',
      name: 'tourist',
      submissionsLastFetchedAt: NOW,
    },
    update: { name: 'tourist', submissionsLastFetchedAt: NOW },
    select: { name: true },
  });
  assert.equal(
    (calls[4].args as { data: Array<{ atcoderAccountId: string }> }).data[0]
      .atcoderAccountId,
    'tourist'
  );
  assert.equal(
    (calls[5].args as { data: Array<{ atcoderAccountId: string }> }).data[0]
      .atcoderAccountId,
    'tourist'
  );
  assert.deepEqual(calls[6].args, {
    data: { atcoderId: 'tourist', atcoderIdChangedAt: NOW },
    where: { id: 'app-user-id' },
  });
});

test('switches to an AtCoder ID that is already stored without fetching', async () => {
  const { calls, transaction } = createTransaction(
    { atcoderId: 'chokudai', atcoderIdChangedAt: null },
    'Tourist'
  );

  const result = await applyAtCoderIdChange(
    transaction,
    'app-user-id',
    'TOURIST',
    NOW,
    null
  );

  assert.deepEqual(result, { status: 'changed' });
  assert.deepEqual(
    calls.map((call) => call.name),
    ['user.findUnique', 'atCoderAccount.upsert', 'user.update']
  );
  assert.deepEqual(calls[1].args, {
    where: { id: 'tourist' },
    create: { id: 'tourist', name: 'TOURIST', submissionsLastFetchedAt: null },
    update: {},
    select: { name: true },
  });
  assert.deepEqual(calls[2].args, {
    data: { atcoderId: 'Tourist', atcoderIdChangedAt: NOW },
    where: { id: 'app-user-id' },
  });
});

test('does not write when the AtCoder ID is unchanged', async () => {
  const { calls, transaction } = createTransaction({
    atcoderId: 'chokudai',
    atcoderIdChangedAt: NOW,
  });

  assert.deepEqual(
    await applyAtCoderIdChange(
      transaction,
      'app-user-id',
      'chokudai',
      NOW,
      PROFILE_DATA
    ),
    { status: 'unchanged' }
  );
  assert.deepEqual(calls.map((call) => call.name), ['user.findUnique']);
});

test('does not write while the seven-day cooldown is active', async () => {
  const { calls, transaction } = createTransaction({
    atcoderId: 'chokudai',
    atcoderIdChangedAt: new Date('2026-07-13T00:00:00.000Z'),
  });

  const result = await applyAtCoderIdChange(
    transaction,
    'app-user-id',
    'tourist',
    NOW,
    PROFILE_DATA
  );

  assert.equal(result.status, 'blocked');
  assert.deepEqual(calls.map((call) => call.name), ['user.findUnique']);
});
