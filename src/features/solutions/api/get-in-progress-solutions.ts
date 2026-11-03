import 'server-only';

import type { InProgressSolutionItem } from '@/features/solutions/types';
import { prisma } from '@/lib/prisma';

/** ステータスが挑戦中（TRYING）の解法記録を、更新が新しい順に返す */
export async function getInProgressSolutions(
  userId?: string,
  limit = 5
): Promise<InProgressSolutionItem[]> {
  if (!userId) {
    return [];
  }

  const solutions = await prisma.solution.findMany({
    where: { userId, status: 'TRYING' },
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
    updatedAt: solution.updatedAt.toISOString(),
  }));
}
