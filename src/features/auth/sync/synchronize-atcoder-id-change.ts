import 'server-only';

import type { RatingHistoryResource } from '@/lib/atcoder/ratings/types';
import type { SubmissionResources } from '@/lib/atcoder/submissions/types';
import type { AtCoderProfileData } from '@/features/auth/types';

interface SynchronizeAtCoderIdChangeDependencies<Result> {
  commit(profileData: AtCoderProfileData): Promise<Result>;
  fetchRatingHistory(
    atcoderId: string,
    signal?: AbortSignal
  ): Promise<RatingHistoryResource[]>;
  fetchSubmissions(
    atcoderId: string,
    fromSecond: number,
    signal?: AbortSignal
  ): Promise<SubmissionResources>;
}

export class AtCoderProfileFetchError extends Error {
  constructor(cause: unknown) {
    super('Failed to fetch AtCoder profile data', { cause });
    this.name = 'AtCoderProfileFetchError';
  }
}

export async function synchronizeAtCoderIdChange<Result>(
  atcoderId: string,
  dependencies: SynchronizeAtCoderIdChangeDependencies<Result>
): Promise<Result> {
  let profileData: AtCoderProfileData;
  try {
    // When one fetch fails, abort the other: the submissions fetch in
    // particular can otherwise keep paging for minutes after the
    // whole attempt has already failed (issue #118).
    const controller = new AbortController();
    const guarded = async <Value>(
      run: (signal: AbortSignal) => Promise<Value>
    ): Promise<Value> => {
      try {
        return await run(controller.signal);
      } catch (error) {
        controller.abort();
        throw error;
      }
    };

    const [submissionData, ratingHistory] = await Promise.all([
      guarded((signal) => dependencies.fetchSubmissions(atcoderId, 0, signal)),
      guarded((signal) => dependencies.fetchRatingHistory(atcoderId, signal)),
    ]);
    profileData = { ratingHistory, submissionData };
  } catch (error) {
    throw new AtCoderProfileFetchError(error);
  }

  return dependencies.commit(profileData);
}
