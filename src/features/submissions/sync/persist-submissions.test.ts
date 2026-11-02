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

interface StoredSubmission {
  result: string;
  point: number;
  executionTime: number | null;
}

function createTransaction(
  atcoderId: string | null,
  options: {
    knownProblemIds?: string[];
    storedSubmissions?: Map<number, StoredSubmission>;
  } = {}
) {
  const knownProblemIds = options.knownProblemIds ?? ['abc001_a'];
  const storedSubmissions = options.storedSubmissions ?? new Map();
  const writes: {
    created: unknown[];
    updates: Array<{ id: number; data: StoredSubmission }>;
    fetchedAt: Date | null;
  } = { created: [], updates: [], fetchedAt: null };

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
      async findMany({ where }) {
        return knownProblemIds
          .filter((id) => where.id.in.includes(id))
          .map((id) => ({ id }));
      },
    },
    submission: {
      async createMany({ data }) {
        writes.created = data;
        return { count: data.length };
      },
      async findMany({ where }) {
        return where.id.in
          .filter((id) => storedSubmissions.has(id))
          .map((id) => ({ id, ...storedSubmissions.get(id)! }));
      },
      async update({ where, data }) {
        writes.updates.push({ id: where.userId_id.id, data });
        return {};
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
  assert.equal(writes.created.length, 1);
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
  assert.deepEqual(writes.created, []);
  assert.equal(writes.fetchedAt, null);
});

test('submission persistence updates a stored submission whose result changed', async () => {
  // Saved while judging (WJ); the re-fetched data has the final result.
  const { transaction, writes } = createTransaction('tourist', {
    storedSubmissions: new Map([
      [1, { result: 'WJ', point: 0, executionTime: null }],
    ]),
  });

  const persisted = await persistSubmissionsForCurrentAtCoderId(
    transaction,
    'user-1',
    'tourist',
    SUBMISSION_DATA,
    FETCHED_AT
  );

  assert.equal(persisted, true);
  assert.deepEqual(writes.created, []);
  assert.deepEqual(writes.updates, [
    { id: 1, data: { result: 'AC', point: 100, executionTime: 10 } },
  ]);
  assert.equal(writes.fetchedAt, FETCHED_AT);
});

test('submission persistence leaves an unchanged stored submission alone', async () => {
  const { transaction, writes } = createTransaction('tourist', {
    storedSubmissions: new Map([
      [1, { result: 'AC', point: 100, executionTime: 10 }],
    ]),
  });

  await persistSubmissionsForCurrentAtCoderId(
    transaction,
    'user-1',
    'tourist',
    SUBMISSION_DATA,
    FETCHED_AT
  );

  assert.deepEqual(writes.created, []);
  assert.deepEqual(writes.updates, []);
});

test('submission persistence keeps the fetch timestamp when a submission is dropped', async () => {
  const { transaction, writes } = createTransaction('tourist', {
    knownProblemIds: [],
  });

  const persisted = await persistSubmissionsForCurrentAtCoderId(
    transaction,
    'user-1',
    'tourist',
    SUBMISSION_DATA,
    FETCHED_AT
  );

  // The submission's problem is not imported yet: nothing is stored and
  // the fetch timestamp stays behind so the next sync retries it.
  assert.equal(persisted, true);
  assert.deepEqual(writes.created, []);
  assert.equal(writes.fetchedAt, null);
});
