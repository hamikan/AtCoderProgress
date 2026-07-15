import type { RatingHistoryResource } from './rating/types';
import type { SubmissionResources } from './submission/type';

export interface AtCoderProfileData {
  ratingHistory: RatingHistoryResource[];
  submissionData: SubmissionResources;
}

interface SynchronizeAtCoderIdChangeDependencies<Result> {
  commit(profileData: AtCoderProfileData): Promise<Result>;
  fetchRatingHistory(atcoderId: string): Promise<RatingHistoryResource[]>;
  fetchSubmissions(
    atcoderId: string,
    fromSecond: number
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
    const [submissionData, ratingHistory] = await Promise.all([
      dependencies.fetchSubmissions(atcoderId, 0),
      dependencies.fetchRatingHistory(atcoderId),
    ]);
    profileData = { ratingHistory, submissionData };
  } catch (error) {
    throw new AtCoderProfileFetchError(error);
  }

  return dependencies.commit(profileData);
}
