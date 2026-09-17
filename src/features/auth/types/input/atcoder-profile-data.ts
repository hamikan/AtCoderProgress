import type { RatingHistoryResource } from '@/lib/atcoder/ratings/types';
import type { SubmissionResources } from '@/lib/atcoder/submissions/types';

export interface AtCoderProfileData {
  ratingHistory: RatingHistoryResource[];
  submissionData: SubmissionResources;
}
