import 'server-only';

import { getContestPage } from '@/features/problems/api/get-contest-page';
import { BACKGROUND_CONTEST_PAGE_SIZE } from '@/features/problems/functions/contest-page-params';
import { getContestProblemIds } from '@/features/problems/functions/contest-workspace';
import { getSubmissionSummaryByProblemIds } from '@/features/submissions/api/get-submission-summary-by-problem-ids';
import type {
  ContestKind,
  ContestOrder,
  ContestPageOptions,
  ContestPageResult,
} from '@/features/problems/types';

export async function getContestChunk(
  contestType: ContestKind = 'abc',
  order: ContestOrder = 'desc',
  options: ContestPageOptions = {}
): Promise<ContestPageResult> {
  const contestPage = await getContestPage(contestType, order, {
    cursor: options.cursor ?? null,
    pageSize: BACKGROUND_CONTEST_PAGE_SIZE,
  });
  const problemIds = getContestProblemIds(contestPage.contests);
  const submissionSummary = options.userId
    ? await getSubmissionSummaryByProblemIds(options.userId, problemIds)
    : { statusMap: {} };

  return {
    ...contestPage,
    submissionStatusMap: submissionSummary.statusMap,
  };
}
