import assert from 'node:assert/strict';
import test from 'node:test';

import { persistSubmissionsForAccount } from './persist-submissions';
import type { SubmissionSyncTransaction } from '@/features/submissions/types';

const FETCHED_AT = new Date('2026-09-15T00:00:00.000Z');
const SUBMISSION_DATA = {
  submissions: [
    {
      id: 1,
      epoch_second: 100,
      problem_id: 'abc001_a',
      contest_id: 'abc001',
      user_id: 'Tourist',
      language: 'C++',
      point: 100,
      length: 1000,
      result: 'AC',
      execution_time: 10,
    },
  ],
};

function createTransaction() {
  const writes: { upserts: unknown[]; submissions: unknown[] } = {
    upserts: [],
    submissions: [],
  };

  const transaction: SubmissionSyncTransaction = {
    atCoderAccount: {
      async upsert(args) {
        writes.upserts.push(args);
        return args.create;
      },
    },
    problem: {
      async findMany() {
        return [{ id: 'abc001_a' }];
      },
    },
    submission: {
      async createMany({ data }) {
        writes.submissions = data;
        return { count: data.length };
      },
    },
  };

  return { transaction, writes };
}

test('stores submissions under the AtCoder account with its fetch time', async () => {
  const { transaction, writes } = createTransaction();

  await persistSubmissionsForAccount(
    transaction,
    'tourist',
    'TOURIST',
    SUBMISSION_DATA,
    FETCHED_AT
  );

  assert.deepEqual(writes.upserts, [
    {
      where: { id: 'tourist' },
      create: {
        id: 'tourist',
        name: 'Tourist',
        submissionsLastFetchedAt: FETCHED_AT,
      },
      update: { name: 'Tourist', submissionsLastFetchedAt: FETCHED_AT },
    },
  ]);
  assert.deepEqual(
    writes.submissions.map((row) => (row as { atcoderAccountId: string }).atcoderAccountId),
    ['tourist']
  );
});

test('keeps the entered name when no submission tells the AtCoder spelling', async () => {
  const { transaction, writes } = createTransaction();

  await persistSubmissionsForAccount(
    transaction,
    'tourist',
    'TOURIST',
    { submissions: [] },
    FETCHED_AT
  );

  assert.deepEqual(writes.upserts, [
    {
      where: { id: 'tourist' },
      create: {
        id: 'tourist',
        name: 'TOURIST',
        submissionsLastFetchedAt: FETCHED_AT,
      },
      update: { submissionsLastFetchedAt: FETCHED_AT },
    },
  ]);
  assert.deepEqual(writes.submissions, []);
});
