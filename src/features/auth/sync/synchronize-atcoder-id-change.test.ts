import assert from 'node:assert/strict';
import test from 'node:test';

import type { RatingHistoryResource } from '@/lib/atcoder/ratings/types';
import type { SubmissionResources } from '@/lib/atcoder/submissions/types';
import {
  AtCoderFullFetchPausedError,
  AtCoderProfileFetchError,
  synchronizeAtCoderIdChange,
} from './synchronize-atcoder-id-change';

const RATING_HISTORY: RatingHistoryResource[] = [];

function page(id: number, userId = 'Tourist'): SubmissionResources {
  return {
    submissions: [
      {
        id,
        epoch_second: id,
        problem_id: 'abc001_a',
        contest_id: 'abc001',
        user_id: userId,
        language: 'C++',
        point: 100,
        length: 100,
        result: 'AC',
        execution_time: 1,
      },
    ],
  };
}

function createDependencies(pages: SubmissionResources[]) {
  const events: string[] = [];
  return {
    events,
    dependencies: {
      getResumeCursor: async () => 0,
      fetchSubmissionPages: async (
        _atcoderId: string,
        _fromSecond: number,
        handlePage: (page: SubmissionResources) => Promise<void>
      ) => {
        for (const fetched of pages) {
          await handlePage(fetched);
        }
      },
      fetchRatingHistory: async () => RATING_HISTORY,
      savePage: async (saved: SubmissionResources) => {
        events.push(`saved ${saved.submissions[0].id}`);
      },
      commit: async () => {
        events.push('committed');
      },
    },
  };
}

test('saves every page as it arrives and commits after the last one', async () => {
  const { dependencies, events } = createDependencies([page(1), page(2)]);
  let committed: unknown;

  await synchronizeAtCoderIdChange('tourist', {
    ...dependencies,
    commit: async (result) => {
      committed = result;
      events.push('committed');
    },
  });

  assert.deepEqual(events, ['saved 1', 'saved 2', 'committed']);
  assert.deepEqual(committed, { ratingHistory: RATING_HISTORY, canonicalName: 'Tourist' });
});

test('starts from the resume cursor so an interrupted fetch continues', async () => {
  const { dependencies } = createDependencies([]);
  let requestedFrom: number | undefined;

  await synchronizeAtCoderIdChange('tourist', {
    ...dependencies,
    getResumeCursor: async () => 1_700_000_000,
    fetchSubmissionPages: async (_atcoderId, fromSecond) => {
      requestedFrom = fromSecond;
    },
  });

  assert.equal(requestedFrom, 1_700_000_000);
});

test('commits without a canonical name when there is no submission', async () => {
  const { dependencies } = createDependencies([]);
  let committed: unknown;

  await synchronizeAtCoderIdChange('tourist', {
    ...dependencies,
    commit: async (result) => {
      committed = result;
    },
  });

  assert.deepEqual(committed, { ratingHistory: RATING_HISTORY, canonicalName: null });
});

test('pauses at the time budget and keeps the pages saved so far', async () => {
  const { dependencies, events } = createDependencies([page(1), page(2), page(3)]);
  const clock = [0, 1_000, 5_000];

  await assert.rejects(
    synchronizeAtCoderIdChange('tourist', {
      ...dependencies,
      now: () => clock.shift() ?? 9_999,
      timeBudgetMs: 3_000,
    }),
    (error) => {
      assert.ok(error instanceof AtCoderFullFetchPausedError);
      assert.equal(error.savedPageCount, 2);
      return true;
    }
  );

  assert.deepEqual(events, ['saved 1', 'saved 2']);
});

for (const failedFetch of ['submissions', 'rating'] as const) {
  test(`does not commit when ${failedFetch} fetch fails`, async () => {
    const { dependencies, events } = createDependencies([page(1)]);
    const fetchError = new Error(`${failedFetch} fetch failed`);

    await assert.rejects(
      synchronizeAtCoderIdChange('tourist', {
        ...dependencies,
        ...(failedFetch === 'submissions'
          ? {
              fetchSubmissionPages: async () => {
                throw fetchError;
              },
            }
          : {
              fetchRatingHistory: async () => {
                throw fetchError;
              },
            }),
      }),
      (error) => {
        assert.ok(error instanceof AtCoderProfileFetchError);
        assert.equal(error.cause, fetchError);
        return true;
      }
    );

    assert.equal(events.includes('committed'), false);
  });
}

test('aborts the other fetch when one of them fails', async () => {
  const { dependencies } = createDependencies([]);
  let submissionsAborted = false;

  await assert.rejects(
    synchronizeAtCoderIdChange('tourist', {
      ...dependencies,
      fetchSubmissionPages: async (_atcoderId, _fromSecond, _handlePage, signal) => {
        await new Promise<never>((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            submissionsAborted = true;
            reject(new Error('aborted'));
          });
        });
      },
      fetchRatingHistory: async () => {
        throw new Error('rating fetch failed');
      },
    }),
    (error) => error instanceof AtCoderProfileFetchError
  );

  assert.equal(submissionsAborted, true);
});

test('does not classify commit failures as profile fetch failures', async () => {
  const { dependencies } = createDependencies([page(1)]);
  const commitError = new Error('commit failed');

  await assert.rejects(
    synchronizeAtCoderIdChange('tourist', {
      ...dependencies,
      commit: async () => {
        throw commitError;
      },
    }),
    (error) => error === commitError
  );
});
