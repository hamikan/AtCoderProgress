import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getContestListEntry,
  loadRemainingContestLists,
  seedContestListEntry,
  subscribeContestList,
  tryStartContestListLoading,
} from './contest-list-store';
import type {
  Contest,
  ContestListEntry,
  ContestPageResult,
} from '@/features/problems/types';

function createContest(id: string): Contest {
  return { id, startEpochSecond: 0, durationSecond: 3600, problems: {} };
}

function createEntry(
  cacheKey: string,
  contests: Contest[],
  nextCursor: string | null,
): ContestListEntry {
  const entry: ContestListEntry = {
    contests,
    submissionStatusMap: {},
    totalContests: 2,
    nextCursor,
    hasMore: nextCursor !== null,
    loadFailed: false,
  };
  return seedContestListEntry(cacheKey, entry);
}

function createChunk(contests: Contest[]): ContestPageResult {
  return {
    contests,
    totalProblems: 0,
    totalContests: 2,
    nextCursor: null,
    hasMore: false,
    submissionStatusMap: {},
  };
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

test('loadRemainingContestLists notifies a screen that subscribed mid-load', async () => {
  const cacheKey = 'abc:desc-mid-load';
  createEntry(cacheKey, [createContest('abc001')], 'cursor-1');
  assert.equal(tryStartContestListLoading(cacheKey), true);

  const chunk = deferred<ContestPageResult>();
  const loading = loadRemainingContestLists({
    cacheKey,
    contestType: 'abc',
    order: 'desc',
    loadChunk: () => chunk.promise,
  });

  let notified = 0;
  const unsubscribe = subscribeContestList(() => {
    notified += 1;
  });

  chunk.resolve(createChunk([createContest('abc002')]));
  await loading;
  unsubscribe();

  assert.equal(notified, 1);
  assert.equal(getContestListEntry(cacheKey)?.contests.length, 2);
  assert.equal(getContestListEntry(cacheKey)?.hasMore, false);
  assert.equal(tryStartContestListLoading(cacheKey), true);
});

test('tryStartContestListLoading prevents a second load for the same key', async () => {
  const cacheKey = 'abc:desc-double-start';
  createEntry(cacheKey, [createContest('abc001')], 'cursor-1');
  assert.equal(tryStartContestListLoading(cacheKey), true);
  assert.equal(tryStartContestListLoading(cacheKey), false);

  const loading = loadRemainingContestLists({
    cacheKey,
    contestType: 'abc',
    order: 'desc',
    loadChunk: async () => createChunk([createContest('abc002')]),
  });
  await loading;

  assert.equal(tryStartContestListLoading(cacheKey), true);
});

test('loadRemainingContestLists marks loadFailed and notifies on failure', async () => {
  const cacheKey = 'abc:desc-load-failed';
  createEntry(cacheKey, [createContest('abc001')], 'cursor-1');
  assert.equal(tryStartContestListLoading(cacheKey), true);

  let notified = 0;
  const unsubscribe = subscribeContestList(() => {
    notified += 1;
  });
  const chunk = deferred<ContestPageResult>();
  const loading = loadRemainingContestLists({
    cacheKey,
    contestType: 'abc',
    order: 'desc',
    loadChunk: () => chunk.promise,
  });

  chunk.reject(new Error('load failed'));
  await loading;
  unsubscribe();

  assert.equal(notified, 1);
  assert.equal(getContestListEntry(cacheKey)?.loadFailed, true);
  assert.equal(tryStartContestListLoading(cacheKey), true);
});
