import 'server-only';

import { prisma } from '@/lib/prisma';
import type { SolutionSidebarContestProblem } from '@/features/solutions/types';

export async function getSidebarContestProblems(
  userId?: string
): Promise<SolutionSidebarContestProblem[]> {
  if (!userId) {
    return [];
  }

  const contestProblems = await prisma.contestProblem.findMany({
    where: { contest: { solutions: { some: { userId } } } },
    select: {
      contestId: true,
      problemId: true,
      problemIndex: true,
      problem: { select: { name: true, difficulty: true } },
    },
  });

  return contestProblems.map(({ problem, ...contestProblem }) => ({
    ...contestProblem,
    problemName: problem.name,
    difficulty: problem.difficulty,
  }));
}
