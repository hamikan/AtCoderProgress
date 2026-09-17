import type { ContestType } from '../output/contest';

export type ProblemFilterStatus =
  | 'ALL'
  | 'AC'
  | 'TRYING'
  | 'UNSOLVED'
  | 'SELF_AC'
  | 'EXPLANATION_AC'
  | 'REVIEW_AC';

export type ProblemOrderBy = 'difficulty' | 'contestDate';
export type SortOrder = 'asc' | 'desc';

export interface ProblemListFiltersInput {
  contestType?: unknown;
  difficultyMax?: unknown;
  difficultyMin?: unknown;
  order?: unknown;
  orderBy?: unknown;
  page?: unknown;
  pageSize?: unknown;
  search?: unknown;
  status?: unknown;
  tags?: unknown;
  userId?: string;
}

export interface NormalizedProblemListFilters {
  contestType: ContestType;
  difficultyMax?: number;
  difficultyMin?: number;
  order: SortOrder;
  orderBy: ProblemOrderBy;
  page: number;
  pageSize?: number;
  search?: string;
  status: ProblemFilterStatus;
  tags: string[];
  userId?: string;
}

export interface ProblemListSearchParamsInput {
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
