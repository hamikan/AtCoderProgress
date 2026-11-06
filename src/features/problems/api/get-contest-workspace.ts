import 'server-only';

import { getContestPage } from '@/features/problems/api/get-contest-page';
import { getContestStatistics } from '@/features/problems/api/get-contest-statistics';
import { getContestProblemIds } from '@/features/problems/functions/contest-workspace';
import { getSubmissionSummaryByProblemIds } from '@/features/submissions/api/get-submission-summary-by-problem-ids';
import { getSubmissionsLastFetchedAt } from '@/features/submissions/api/get-submissions-last-fetched-at';
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
  const [contestPage, stats, submissionsLastFetchedAt] = await Promise.all([
    getContestPage(contestType, order, options),
    getContestStatistics(contestType, options.atcoderAccountId),
    options.atcoderAccountId
      ? getSubmissionsLastFetchedAt(options.atcoderAccountId)
      : null,
  ]);
  const problemIds = getContestProblemIds(contestPage.contests);
  const submissionSummary = options.atcoderAccountId
    ? await getSubmissionSummaryByProblemIds(options.atcoderAccountId, problemIds)
    : { statusMap: {} };

  return {
    ...contestPage,
    submissionStatusMap: submissionSummary.statusMap,
    stats,
    submissionsLastFetchedAt,
  };
}
