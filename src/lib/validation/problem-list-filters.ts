import type { ContestType } from '@/types/contest';
import { MAX_PROBLEM_SEARCH_QUERY_LENGTH } from './problem-search';

export const DEFAULT_PROBLEM_PAGE = 1;
export const DEFAULT_PROBLEM_PAGE_SIZE = 50;
export const MAX_PROBLEM_PAGE = 10_000;
export const MAX_PROBLEM_PAGE_SIZE = 100;
export const MIN_PROBLEM_DIFFICULTY = 0;
export const MAX_PROBLEM_DIFFICULTY = 4000;
export const MAX_PROBLEM_FILTER_TAGS = 30;
export const MAX_PROBLEM_FILTER_TAG_LENGTH = 50;

const VALID_CONTEST_TYPES = ['ALL', 'ABC', 'ARC', 'AGC'] as const;
const VALID_PROBLEM_STATUSES = [
  'ALL',
  'AC',
  'TRYING',
  'UNSOLVED',
  'SELF_AC',
  'EXPLANATION_AC',
  'REVIEW_AC',
] as const;
const VALID_PROBLEM_ORDER_BY = ['difficulty', 'contestDate'] as const;
const VALID_SORT_ORDERS = ['asc', 'desc'] as const;

export type ProblemFilterStatus = (typeof VALID_PROBLEM_STATUSES)[number];
export type ProblemOrderBy = (typeof VALID_PROBLEM_ORDER_BY)[number];
export type SortOrder = (typeof VALID_SORT_ORDERS)[number];

export interface NormalizedProblemListFilters {
  contestType: ContestType;
  difficulty_max?: number;
  difficulty_min?: number;
  order: SortOrder;
  orderBy: ProblemOrderBy;
  page: number;
  pageSize?: number;
  search?: string;
  status: ProblemFilterStatus;
  tags: string[];
  userId?: string;
}

interface ProblemListFiltersInput {
  contestType?: unknown;
  difficulty_max?: unknown;
  difficulty_min?: unknown;
  order?: unknown;
  orderBy?: unknown;
  page?: unknown;
  pageSize?: unknown;
  search?: unknown;
  status?: unknown;
  tags?: unknown;
  userId?: string;
}

function isOneOf<T extends readonly string[]>(value: unknown, values: T): value is T[number] {
  return typeof value === 'string' && values.includes(value as T[number]);
}

function parseInteger(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : null;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeOptionalSearch(input: unknown): string | undefined {
  if (typeof input !== 'string') {
    return undefined;
  }

  const value = input.trim();
  if (!value) {
    return undefined;
  }

  return value.slice(0, MAX_PROBLEM_SEARCH_QUERY_LENGTH);
}

function normalizeTagNames(input: unknown): string[] {
  const rawTags =
    typeof input === 'string'
      ? input.split(',')
      : Array.isArray(input)
        ? input
        : [];

  const tags = rawTags.reduce<string[]>((result, tag) => {
    if (typeof tag !== 'string') {
      return result;
    }

    const normalizedTag = tag.trim().replace(/\s+/g, ' ');
    if (!normalizedTag || normalizedTag.length > MAX_PROBLEM_FILTER_TAG_LENGTH) {
      return result;
    }

    const hasSameTag = result.some(
      (existingTag) => existingTag.toLocaleLowerCase() === normalizedTag.toLocaleLowerCase()
    );

    return hasSameTag ? result : [...result, normalizedTag];
  }, []);

  return tags.slice(0, MAX_PROBLEM_FILTER_TAGS);
}

function normalizeProblemPage(input: unknown): number {
  const page = parseInteger(input);
  if (page === null) {
    return DEFAULT_PROBLEM_PAGE;
  }

  return clamp(page, DEFAULT_PROBLEM_PAGE, MAX_PROBLEM_PAGE);
}

function normalizeProblemPageSize(input: unknown): number | undefined {
  if (input === undefined) {
    return undefined;
  }

  const pageSize = parseInteger(input);
  if (pageSize === null || pageSize < 1 || pageSize > MAX_PROBLEM_PAGE_SIZE) {
    return DEFAULT_PROBLEM_PAGE_SIZE;
  }

  return pageSize;
}

function normalizeDifficulty(input: unknown): number | undefined {
  const difficulty = parseInteger(input);
  if (difficulty === null) {
    return undefined;
  }

  return clamp(difficulty, MIN_PROBLEM_DIFFICULTY, MAX_PROBLEM_DIFFICULTY);
}

function normalizeDifficultyRange(
  minInput: unknown,
  maxInput: unknown
): { difficulty_max?: number; difficulty_min?: number } {
  const min = normalizeDifficulty(minInput);
  const max = normalizeDifficulty(maxInput);

  if (min === undefined || max === undefined || min <= max) {
    return {
      difficulty_max: max,
      difficulty_min: min,
    };
  }

  return {
    difficulty_max: min,
    difficulty_min: max,
  };
}

export function normalizeProblemListFilters(input: ProblemListFiltersInput): NormalizedProblemListFilters {
  const contestType = typeof input.contestType === 'string' ? input.contestType.toUpperCase() : '';
  const status = typeof input.status === 'string' ? input.status.toUpperCase() : '';
  const order = typeof input.order === 'string' ? input.order.toLowerCase() : '';
  const orderBy = input.orderBy;
  const { difficulty_max, difficulty_min } = normalizeDifficultyRange(
    input.difficulty_min,
    input.difficulty_max
  );
  const pageSize = normalizeProblemPageSize(input.pageSize);
  const search = normalizeOptionalSearch(input.search);

  return {
    contestType: isOneOf(contestType, VALID_CONTEST_TYPES) ? contestType : 'ALL',
    difficulty_max,
    difficulty_min,
    order: isOneOf(order, VALID_SORT_ORDERS) ? order : 'desc',
    orderBy: isOneOf(orderBy, VALID_PROBLEM_ORDER_BY) ? orderBy : 'contestDate',
    page: normalizeProblemPage(input.page),
    ...(pageSize !== undefined ? { pageSize } : {}),
    ...(search !== undefined ? { search } : {}),
    status: isOneOf(status, VALID_PROBLEM_STATUSES) ? status : 'ALL',
    tags: normalizeTagNames(input.tags),
    ...(input.userId !== undefined ? { userId: input.userId } : {}),
  };
}
