import 'server-only';

import { buildSolvedProblemStatistics } from '@/features/submissions/functions/build-solved-problem-statistics';
import type { SolvedProblemStatistics } from '@/features/submissions/types';
import { prisma } from '@/lib/prisma';

export async function getSolvedProblemStatistics(
  atcoderAccountId?: string | null
): Promise<SolvedProblemStatistics> {
  const submissions = atcoderAccountId
    ? await prisma.submission.findMany({
        where: { atcoderAccountId, result: 'AC' },
        select: { problemId: true, epochSecond: true },
      })
    : [];

  return buildSolvedProblemStatistics(submissions, new Date());
}
