import 'server-only';

import type { InProgressSolutionItem } from '@/features/solutions/types';
import { prisma } from '@/lib/prisma';

/**
 * Solution records the user has started but not finished:
 * still trying (TRYING) or created without a status yet (UNSOLVED),
 * most recently edited first.
 */
export async function getInProgressSolutions(
  userId?: string,
  limit = 5
): Promise<InProgressSolutionItem[]> {
  if (!userId) {
    return [];
  }

  const solutions = await prisma.solution.findMany({
    where: { userId, status: { in: ['TRYING', 'UNSOLVED'] } },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      problem: {
        select: { name: true },
      },
    },
  });

  return solutions.map((solution) => ({
    id: solution.id,
    problemId: solution.problemId,
    problemName: solution.problem.name,
    contestId: solution.contestId,
    status: solution.status,
    updatedAt: solution.updatedAt.toISOString(),
  }));
}
