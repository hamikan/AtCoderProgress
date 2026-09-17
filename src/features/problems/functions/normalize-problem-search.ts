import {
  MAX_PROBLEM_SEARCH_QUERY_LENGTH,
  problemSearchQuerySchema,
} from '@/features/problems/schemas/problem-input';

export const DEFAULT_PROBLEM_SEARCH_LIMIT = 10;
export const MAX_PROBLEM_SEARCH_LIMIT = 100;
export { MAX_PROBLEM_SEARCH_QUERY_LENGTH };

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

export function normalizeProblemSearchQuery(query: unknown): string | null {
  const parsed = problemSearchQuerySchema.safeParse(query);
  if (parsed.success) {
    return parsed.data;
  }

  if (typeof query !== 'string' || query.trim().length < 2) {
    return null;
  }

  if (query.trim().length > MAX_PROBLEM_SEARCH_QUERY_LENGTH) {
    throw new Error('Search query is too long');
  }

  return null;
}

export function normalizeProblemSearchLimit(limit: unknown): number {
  const normalizedLimit = parseInteger(limit);

  if (
    normalizedLimit === null ||
    normalizedLimit < 1 ||
    normalizedLimit > MAX_PROBLEM_SEARCH_LIMIT
  ) {
    return DEFAULT_PROBLEM_SEARCH_LIMIT;
  }

  return normalizedLimit;
}
