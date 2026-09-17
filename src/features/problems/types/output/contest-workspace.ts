import type { SubmissionStatus } from '@/features/submissions/types';

import type { Contest } from './contest';

export interface ContestPageData {
  contests: Contest[];
  totalProblems: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ContestStats {
  total: number;
  ac: number;
  trying: number;
  unsolved: number;
}

export interface ContestPageResult extends ContestPageData {
  submissionStatusMap: Record<string, SubmissionStatus>;
}

export interface ContestWorkspaceResult extends ContestPageResult {
  stats: ContestStats;
}
