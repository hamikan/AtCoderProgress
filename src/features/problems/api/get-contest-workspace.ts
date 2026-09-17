import 'server-only';

import { getContestPage } from '@/features/problems/api/get-contest-page';
import { getContestStatistics } from '@/features/problems/api/get-contest-statistics';
import { getContestProblemIds } from '@/features/problems/functions/contest-workspace';
import { getSubmissionSummaryByProblemIds } from '@/features/submissions/api/get-submission-summary-by-problem-ids';
import type {
  ContestKind,
  ContestOrder,
  ContestPageOptions,
  ContestWorkspaceResult,
} from '@/features/problems/types';

export async function getContestWorkspace(
  contestType: ContestKind = 'abc',
  order: ContestOrder = 'desc',
  options: ContestPageOptions = {}
): Promise<ContestWorkspaceResult> {
  const [contestPage, stats] = await Promise.all([
    getContestPage(contestType, order, options),
    getContestStatistics(contestType, options.userId),
  ]);
  const problemIds = getContestProblemIds(contestPage.contests);
  const submissionSummary = options.userId
    ? await getSubmissionSummaryByProblemIds(options.userId, problemIds)
    : { statusMap: {} };

  return {
    ...contestPage,
    submissionStatusMap: submissionSummary.statusMap,
    stats,
  };
}
