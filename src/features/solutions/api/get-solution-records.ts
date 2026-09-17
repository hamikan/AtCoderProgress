import 'server-only';

import { prisma } from '@/lib/prisma';
import type { SolutionRecordListItem } from '@/features/solutions/types';

export async function getSolutionRecords(
  userId: string | undefined,
  problemId: string,
  contestId?: string
): Promise<SolutionRecordListItem[]> {
  if (!userId) {
    return [];
  }

  const solutions = await prisma.solution.findMany({
    where: {
      userId,
      problemId,
      ...(contestId ? { contestId } : {}),
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      contestId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      status: true,
    },
  });

  return solutions.map((solution) => ({
    ...solution,
    createdAt: solution.createdAt.toISOString(),
    updatedAt: solution.updatedAt.toISOString(),
  }));
}
