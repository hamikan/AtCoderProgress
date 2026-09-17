import assert from 'node:assert/strict';
import test from 'node:test';

import { persistSubmissionsForCurrentAtCoderId } from './persist-submissions';
import type { SubmissionSyncTransaction } from '@/features/submissions/types';

const FETCHED_AT = new Date('2026-09-15T00:00:00.000Z');
const SUBMISSION_DATA = {
  submissions: [
    {
      id: 1,
      epoch_second: 100,
      problem_id: 'abc001_a',
      contest_id: 'abc001',
      user_id: 'tourist',
      language: 'C++',
      point: 100,
      length: 1000,
      result: 'AC',
      execution_time: 10,
    },
  ],
};

function createTransaction(atcoderId: string | null) {
  const writes: {
    submissions: unknown[];
    fetchedAt: Date | null;
  } = { submissions: [], fetchedAt: null };

  const transaction: SubmissionSyncTransaction = {
    user: {
      async findUnique() {
        return { atcoderId };
      },
      async updateMany({ data }) {
        writes.fetchedAt = data.submissionsLastFetchedAt;
        return { count: atcoderId === 'tourist' ? 1 : 0 };
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

test('submission persistence stores data and fetch time atomically', async () => {
  const { transaction, writes } = createTransaction('tourist');

  const persisted = await persistSubmissionsForCurrentAtCoderId(
    transaction,
    'user-1',
    'tourist',
    SUBMISSION_DATA,
    FETCHED_AT
  );

  assert.equal(persisted, true);
  assert.equal(writes.submissions.length, 1);
  assert.equal(writes.fetchedAt, FETCHED_AT);
});

test('submission persistence writes nothing after the AtCoder ID changes', async () => {
  const { transaction, writes } = createTransaction('another-user');

  const persisted = await persistSubmissionsForCurrentAtCoderId(
    transaction,
    'user-1',
    'tourist',
    SUBMISSION_DATA,
    FETCHED_AT
  );

  assert.equal(persisted, false);
  assert.deepEqual(writes.submissions, []);
  assert.equal(writes.fetchedAt, null);
});
