import {
  normalizeProblemListFilters,
} from './normalize-problem-list-filters';
import type {
  NormalizedProblemListFilters,
  ProblemListSearchParamsInput,
} from '@/features/problems/types/input/problem-list-filters';

export function normalizeProblemListSearchParams(
  params: ProblemListSearchParamsInput,
  userId?: string
): NormalizedProblemListFilters {
  return normalizeProblemListFilters({
    contestType: params.contestType,
    difficultyMax: params.difficulty_max,
    difficultyMin: params.difficulty_min,
    order: params.order,
    orderBy: params.orderBy,
    page: params.page,
    search: params.search,
    status: params.status,
    tags: params.tags,
    userId,
  });
}
