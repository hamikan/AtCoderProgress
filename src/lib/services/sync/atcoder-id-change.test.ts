import assert from 'node:assert/strict';
import test from 'node:test';

import type { RatingHistoryResource } from './rating/types';
import type { SubmissionResources } from './submission/type';
import {
  AtCoderProfileFetchError,
  synchronizeAtCoderIdChange,
} from './atcoder-id-change';

const SUBMISSION_DATA: SubmissionResources = { submissions: [] };
const RATING_HISTORY: RatingHistoryResource[] = [];

for (const failedFetch of ['submissions', 'rating'] as const) {
  test(`does not commit when ${failedFetch} fetch fails`, async () => {
    let commitCount = 0;
    const fetchError = new Error(`${failedFetch} fetch failed`);

    await assert.rejects(
      synchronizeAtCoderIdChange('tourist', {
        fetchSubmissions: async (atcoderId, fromSecond) => {
          assert.equal(atcoderId, 'tourist');
          assert.equal(fromSecond, 0);
          if (failedFetch === 'submissions') {
            throw fetchError;
          }
          return SUBMISSION_DATA;
        },
        fetchRatingHistory: async (atcoderId) => {
          assert.equal(atcoderId, 'tourist');
          if (failedFetch === 'rating') {
            throw fetchError;
          }
          return RATING_HISTORY;
        },
        commit: async () => {
          commitCount += 1;
          return { status: 'changed' } as const;
        },
      }),
      (error) => {
        assert.ok(error instanceof AtCoderProfileFetchError);
        assert.equal(error.cause, fetchError);
        return true;
      }
    );

    assert.equal(commitCount, 0);
  });
}

test('commits only after both profile data fetches succeed', async () => {
  const events: string[] = [];

  const result = await synchronizeAtCoderIdChange('tourist', {
    fetchSubmissions: async (atcoderId, fromSecond) => {
      assert.equal(atcoderId, 'tourist');
      assert.equal(fromSecond, 0);
      events.push('submissions fetched');
      return SUBMISSION_DATA;
    },
    fetchRatingHistory: async (atcoderId) => {
      assert.equal(atcoderId, 'tourist');
      events.push('rating fetched');
      return RATING_HISTORY;
    },
    commit: async (profileData) => {
      events.push('committed');
      assert.deepEqual(profileData, {
        ratingHistory: RATING_HISTORY,
        submissionData: SUBMISSION_DATA,
      });
      return { status: 'changed' } as const;
    },
  });

  assert.deepEqual(result, { status: 'changed' });
  assert.ok(events.indexOf('committed') > events.indexOf('submissions fetched'));
  assert.ok(events.indexOf('committed') > events.indexOf('rating fetched'));
});

test('does not classify commit failures as profile fetch failures', async () => {
  const commitError = new Error('commit failed');

  await assert.rejects(
    synchronizeAtCoderIdChange('tourist', {
      fetchSubmissions: async () => SUBMISSION_DATA,
      fetchRatingHistory: async () => RATING_HISTORY,
      commit: async () => {
        throw commitError;
      },
    }),
    (error) => error === commitError
  );
});
