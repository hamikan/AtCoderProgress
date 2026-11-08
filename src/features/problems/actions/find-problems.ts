'use server';

import { searchProblems } from '@/features/problems/api/search-problems';
import { problemSearchQuerySchema } from '@/features/problems/schemas/problem-input';
import type { ProblemSearchResult } from '@/features/problems/types';

export async function findProblems(query: unknown): Promise<ProblemSearchResult[]> {
  const parsed = problemSearchQuerySchema.safeParse(query);
  if (!parsed.success) {
    return [];
  }
  return searchProblems(parsed.data);
}
