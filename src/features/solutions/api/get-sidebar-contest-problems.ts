import 'server-only';

import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { SolutionSidebarContestProblem } from '@/features/solutions/types';

export async function findSidebarContestProblems(
  where: Prisma.ContestProblemWhereInput
): Promise<SolutionSidebarContestProblem[]> {
  const contestProblems = await prisma.contestProblem.findMany({
    where,
    select: {
      contestId: true,
      problemId: true,
      problemIndex: true,
      problem: { select: { name: true, difficulty: true } },
    },
    orderBy: { problemIndex: 'asc' },
  });

  return contestProblems.map(({ problem, ...contestProblem }) => ({
    ...contestProblem,
    problemName: problem.name,
    difficulty: problem.difficulty,
  }));
}

export async function getSidebarContestProblems(
  userId?: string
): Promise<SolutionSidebarContestProblem[]> {
  if (!userId) {
    return [];
  }

  return findSidebarContestProblems({ contest: { solutions: { some: { userId } } } });
}
