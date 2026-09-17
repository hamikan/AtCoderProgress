import 'server-only';

import {
  normalizeProblemSearchLimit,
  normalizeProblemSearchQuery,
} from '@/features/problems/functions/normalize-problem-search';
import type { ProblemSearchResult } from '@/features/problems/types';
import { prisma } from '@/lib/prisma';

export async function searchProblems(
  query: string,
  limit: number = 10
): Promise<ProblemSearchResult[]> {
  const normalizedQuery = normalizeProblemSearchQuery(query);
  if (!normalizedQuery) return [];

  return prisma.problem.findMany({
    where: {
      OR: [
        { id: { contains: normalizedQuery, mode: 'insensitive' } },
        { name: { contains: normalizedQuery, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      firstContestId: true,
    },
    take: normalizeProblemSearchLimit(limit),
  });
}
