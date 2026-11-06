import type { SubmissionStatus } from '@/features/submissions/types';

import type { Contest } from './contest';

export interface ContestListEntry {
  contests: Contest[];
  submissionStatusMap: Record<string, SubmissionStatus>;
  totalContests: number;
  nextCursor: string | null;
  hasMore: boolean;
  loadFailed: boolean;
}
