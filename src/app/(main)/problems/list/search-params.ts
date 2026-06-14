import {
  normalizeProblemListFilters,
  type NormalizedProblemListFilters,
} from '@/lib/validation/problem-list-filters';

interface ProblemListSearchParamsInput {
  contestType?: string;
  difficulty_max?: string;
  difficulty_min?: string;
  order?: string;
  orderBy?: string;
  page?: string;
  search?: string;
  status?: string;
  tags?: string;
}

export function normalizeProblemListSearchParams(
  params: ProblemListSearchParamsInput,
  userId?: string
): NormalizedProblemListFilters {
  return normalizeProblemListFilters({
    contestType: params.contestType,
    difficulty_max: params.difficulty_max,
    difficulty_min: params.difficulty_min,
    order: params.order,
    orderBy: params.orderBy,
    page: params.page,
    search: params.search,
    status: params.status,
    tags: params.tags,
    userId,
  });
}
