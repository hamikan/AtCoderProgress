import assert from 'node:assert/strict';
import test from 'node:test';

import {
  persistSubmissionsForAccount,
  persistSubmissionsInTransaction,
  promotePendingSubmissions,
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

const PENDING_ROW = {
  id: 3,
  epochSecond: 300,
  problemId: 'abc001_a',
  contestId: 'abc001',
  atcoderAccountId: 'tourist',
  language: 'C++',
  point: 100,
  length: 1000,
  result: 'AC',
  executionTime: 10,
};

function createTransaction({
  storedSubmissions = [],
  knownProblemIds = ['abc001_a'],
  pendingRows = [],
}: {
  storedSubmissions?: StoredSubmission[];
  knownProblemIds?: string[];
  pendingRows?: Array<typeof PENDING_ROW>;
} = {}) {
  const writes: {
    upserts: unknown[];
    submissions: unknown[];
    updates: unknown[];
    pendingCreated: Array<{ id: number }>;
    pendingDeleted: number[];
  } = { upserts: [], submissions: [], updates: [], pendingCreated: [], pendingDeleted: [] };

  const transaction: SubmissionSyncTransaction = {
    atCoderAccount: {
      async upsert(args) {
        writes.upserts.push(args);
        return args.create;
      },
    },
    problem: {
      async findMany({ where }) {
        return where.id.in.filter((id) => knownProblemIds.includes(id)).map((id) => ({ id }));
      },
    },
    submission: {
      async findMany() {
        return storedSubmissions;
      },
      async createMany({ data }) {
        writes.submissions.push(...data);
        return { count: data.length };
      },
      async update(args) {
        writes.updates.push(args);
        return {};
      },
    },
    pendingSubmission: {
      async findMany({ where }) {
        return pendingRows.filter(
          (row) => where.atcoderAccountId === undefined || row.atcoderAccountId === where.atcoderAccountId
        );
      },
      async createMany({ data }) {
        writes.pendingCreated.push(...data);
        return { count: data.length };
      },
      async deleteMany({ where }) {
        writes.pendingDeleted.push(...where.id.in);
        return { count: where.id.in.length };
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
  const { transaction, writes } = createTransaction({
    storedSubmissions: [{ id: 1, result: 'WJ', point: 0, executionTime: null }],
  });

  const result = await persistSubmissionsInTransaction(
    transaction,
    'tourist',
    SUBMISSION_DATA
  );

  assert.deepEqual(result, { storedCount: 0, updatedCount: 1, pendingCount: 0, promotedCount: 0 });
  assert.deepEqual(writes.submissions, []);
  assert.deepEqual(writes.updates, [
    {
      where: { id: 1 },
      data: { result: 'AC', point: 100, executionTime: 10 },
    },
  ]);
});

test('does not rewrite a stored submission that has not changed', async () => {
  const { transaction, writes } = createTransaction({
    storedSubmissions: [{ id: 1, result: 'AC', point: 100, executionTime: 10 }],
  });

  const result = await persistSubmissionsInTransaction(
    transaction,
    'tourist',
    SUBMISSION_DATA
  );

  assert.deepEqual(result, { storedCount: 0, updatedCount: 0, pendingCount: 0, promotedCount: 0 });
  assert.deepEqual(writes.updates, []);
});

test('keeps submissions for problems that are not imported yet as pending', async () => {
  const { transaction, writes } = createTransaction();

  const result = await persistSubmissionsInTransaction(transaction, 'tourist', {
    submissions: [{ ...SUBMISSION_DATA.submissions[0], id: 2, problem_id: 'abc999_a' }],
  });

  assert.deepEqual(result, { storedCount: 0, updatedCount: 0, pendingCount: 1, promotedCount: 0 });
  assert.deepEqual(writes.submissions, []);
  assert.deepEqual(
    writes.pendingCreated.map((row) => row.id),
    [2]
  );
});

test('moves pending submissions into submissions once their problem is imported', async () => {
  const { transaction, writes } = createTransaction({ pendingRows: [PENDING_ROW] });

  const result = await persistSubmissionsInTransaction(transaction, 'tourist', {
    submissions: [],
  });

  assert.deepEqual(result, { storedCount: 0, updatedCount: 0, pendingCount: 0, promotedCount: 1 });
  assert.deepEqual(writes.submissions, [PENDING_ROW]);
  assert.deepEqual(writes.pendingDeleted, [3]);
});

test('leaves pending submissions whose problem is still missing', async () => {
  const { transaction, writes } = createTransaction({
    pendingRows: [{ ...PENDING_ROW, problemId: 'ahc069_b' }],
  });

  const result = await promotePendingSubmissions(transaction);

  assert.equal(result, 0);
  assert.deepEqual(writes.submissions, []);
  assert.deepEqual(writes.pendingDeleted, []);
});
