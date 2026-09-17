import 'server-only';

import { prisma } from '@/lib/prisma';
import type { SolutionWithTags } from '@/features/solutions/types';

export async function getSolutionById(
  userId: string,
  solutionId: string
): Promise<SolutionWithTags | null> {
  const solution = await prisma.solution.findFirst({
    where: { id: solutionId, userId },
    include: {
      userTags: {
        select: {
          userTag: { select: { name: true } },
        },
      },
    },
  });

  if (!solution) {
    return null;
  }

  return {
    id: solution.id,
    userId: solution.userId,
    problemId: solution.problemId,
    contestId: solution.contestId,
    title: solution.title,
    content: solution.content,
    status: solution.status,
    createdAt: solution.createdAt.toISOString(),
    updatedAt: solution.updatedAt.toISOString(),
    userTags: solution.userTags,
  };
}
