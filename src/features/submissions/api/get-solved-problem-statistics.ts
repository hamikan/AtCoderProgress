import 'server-only';

import { buildSolvedProblemStatistics } from '@/features/submissions/functions/build-solved-problem-statistics';
import type { SolvedProblemStatistics } from '@/features/submissions/types';
import { prisma } from '@/lib/prisma';

export async function getSolvedProblemStatistics(
  userId?: string
): Promise<SolvedProblemStatistics> {
  const submissions = userId
    ? await prisma.submission.findMany({
        where: { userId, result: 'AC' },
        select: { problemId: true, epochSecond: true },
      })
    : [];

  return buildSolvedProblemStatistics(submissions, new Date());
}
