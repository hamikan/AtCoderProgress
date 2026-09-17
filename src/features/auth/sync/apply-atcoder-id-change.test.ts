import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyAtCoderIdChange,
  isAtCoderIdAvailableForUser,
} from './apply-atcoder-id-change';
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
  }
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
    submission: {
      async deleteMany(args: unknown) {
        calls.push({ name: 'submission.deleteMany', args });
        return { count: 1 };
      },
      async createMany(args: unknown) {
        calls.push({ name: 'submission.createMany', args });
        return { count: 1 };
      },
    },
    userRatingHistory: {
      async deleteMany(args: unknown) {
        calls.push({ name: 'userRatingHistory.deleteMany', args });
        return { count: 1 };
      },
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

test('atomically replaces the public AtCoder ID data without touching private records', async () => {
  const { calls, transaction } = createTransaction({
    atcoderId: 'chokudai',
    atcoderIdChangedAt: new Date('2026-07-01T00:00:00.000Z'),
  });

  const result = await applyAtCoderIdChange(
    transaction,
    'app-user-id',
    'tourist',
    NOW,
    PROFILE_DATA
  );

  assert.deepEqual(result, { status: 'changed' });
  assert.deepEqual(
    calls.map((call) => call.name),
    [
      'user.findUnique',
      'user.update',
      'submission.deleteMany',
      'userRatingHistory.deleteMany',
      'problem.findMany',
      'submission.createMany',
      'userRatingHistory.createMany',
    ]
  );
  assert.deepEqual(calls[1].args, {
    data: {
      atcoderId: 'tourist',
      atcoderIdChangedAt: NOW,
      submissionsLastFetchedAt: NOW,
    },
    where: { id: 'app-user-id' },
  });
  assert.deepEqual(calls[5].args, {
    data: [
      {
        id: 1,
        epochSecond: 1,
        problemId: 'abc001_a',
        contestId: 'abc001',
        userId: 'app-user-id',
        language: 'C++',
        point: 100,
        length: 100,
        result: 'AC',
        executionTime: 1,
      },
    ],
    skipDuplicates: true,
  });
  assert.deepEqual(calls[6].args, {
    data: [
      {
        userId: 'app-user-id',
        isRated: true,
        place: 1,
        oldRating: 3800,
        newRating: 3900,
        performance: 4000,
        innerPerformance: 4000,
        contestScreenName: 'abc001.contest.atcoder.jp',
        contestName: 'AtCoder Beginner Contest 001',
        contestNameEn: 'AtCoder Beginner Contest 001',
        endTime: new Date('2026-07-13T00:00:00.000Z'),
      },
    ],
    skipDuplicates: true,
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

test('detects an AtCoder ID registered by another app user', async () => {
  const createReader = (ownerId: string | null) => ({
    user: {
      async findUnique() {
        return ownerId ? { id: ownerId } : null;
      },
    },
  });

  assert.equal(
    await isAtCoderIdAvailableForUser(
      createReader('other-user-id'),
      'app-user-id',
      'tourist'
    ),
    false
  );
  assert.equal(
    await isAtCoderIdAvailableForUser(
      createReader('app-user-id'),
      'app-user-id',
      'tourist'
    ),
    true
  );
  assert.equal(
    await isAtCoderIdAvailableForUser(
      createReader(null),
      'app-user-id',
      'tourist'
    ),
    true
  );
});
