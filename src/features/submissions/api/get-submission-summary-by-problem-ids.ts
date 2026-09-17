import 'server-only';

import { buildSubmissionSummary } from '@/features/submissions/functions/build-submission-summary';
import { prisma } from '@/lib/prisma';
import type { SubmissionSummaryRow } from '@/features/submissions/types';

async function getSubmissionsByProblemIds(
  userId: string,
  problemIds: string[]
): Promise<SubmissionSummaryRow[]> {
  if (problemIds.length === 0) return [];

  return prisma.submission.findMany({
    where: {
      userId,
      problemId: { in: problemIds },
    },
    select: {
      problemId: true,
      result: true,
      epochSecond: true,
    },
  });
}

export async function getSubmissionSummaryByProblemIds(userId: string, problemIds: string[]) {
  const submissions = await getSubmissionsByProblemIds(userId, problemIds);
  return buildSubmissionSummary(submissions);
}
