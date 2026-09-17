import 'server-only';

import { prisma } from '@/lib/prisma';
import type { SolutionListItem } from '@/features/solutions/types';

export async function getUserSolutions(userId?: string): Promise<SolutionListItem[]> {
  if (!userId) {
    return [];
  }

  const solutions = await prisma.solution.findMany({
    where: { userId },
    include: {
      problem: { include: { contests: true } },
    },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
  });

  const groupedSolutions = new Map<string, SolutionListItem>();

  for (const solution of solutions) {
    const key = `${solution.contestId}:${solution.problemId}`;
    const existing = groupedSolutions.get(key);

    if (existing) {
      groupedSolutions.set(key, {
        ...existing,
        solutionCount: existing.solutionCount + 1,
      });
      continue;
    }

    const problemIndex =
      solution.problem.contests.find(
        (contest) => contest.contestId === solution.contestId
      )?.problemIndex ?? '';

    groupedSolutions.set(key, {
      latestSolutionId: solution.id,
      problemId: solution.problemId,
      problemIndex,
      problemName: solution.problem.name,
      contestId: solution.contestId,
      difficulty: solution.problem.difficulty,
      updatedAt: solution.updatedAt.toISOString(),
      solutionCount: 1,
    });
  }

  return [...groupedSolutions.values()];
}
