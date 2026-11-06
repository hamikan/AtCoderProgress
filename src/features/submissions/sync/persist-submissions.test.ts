import assert from 'node:assert/strict';
import test from 'node:test';

import {
  persistSubmissionsForAccount,
  persistSubmissionsInTransaction,
} from './persist-submissions';
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

type StoredSubmission = {
  id: number;
  result: string;
  point: number;
  executionTime: number | null;
};

function createTransaction(storedSubmissions: StoredSubmission[] = []) {
  const writes: {
    upserts: unknown[];
    submissions: unknown[];
    updates: unknown[];
  } = { upserts: [], submissions: [], updates: [] };

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
      async findMany() {
        return storedSubmissions;
      },
      async createMany({ data }) {
        writes.submissions = data;
        return { count: data.length };
      },
      async update(args) {
        writes.updates.push(args);
        return {};
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

test('updates a stored submission whose judge result changed', async () => {
  const { transaction, writes } = createTransaction([
    { id: 1, result: 'WJ', point: 0, executionTime: null },
  ]);

  const result = await persistSubmissionsInTransaction(
    transaction,
    'tourist',
    SUBMISSION_DATA
  );

  assert.deepEqual(result, { storedCount: 0, updatedCount: 1, droppedCount: 0 });
  assert.deepEqual(writes.submissions, []);
  assert.deepEqual(writes.updates, [
    {
      where: { id: 1 },
      data: { result: 'AC', point: 100, executionTime: 10 },
    },
  ]);
});

test('does not rewrite a stored submission that has not changed', async () => {
  const { transaction, writes } = createTransaction([
    { id: 1, result: 'AC', point: 100, executionTime: 10 },
  ]);

  const result = await persistSubmissionsInTransaction(
    transaction,
    'tourist',
    SUBMISSION_DATA
  );

  assert.deepEqual(result, { storedCount: 0, updatedCount: 0, droppedCount: 0 });
  assert.deepEqual(writes.updates, []);
});

test('counts submissions for problems that are not imported yet as dropped', async () => {
  const { transaction, writes } = createTransaction();

  const result = await persistSubmissionsInTransaction(transaction, 'tourist', {
    submissions: [
      { ...SUBMISSION_DATA.submissions[0], id: 2, problem_id: 'abc999_a' },
    ],
  });

  assert.deepEqual(result, { storedCount: 0, updatedCount: 0, droppedCount: 1 });
  assert.deepEqual(writes.submissions, []);
});
