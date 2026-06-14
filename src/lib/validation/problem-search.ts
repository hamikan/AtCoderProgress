export const DEFAULT_PROBLEM_SEARCH_LIMIT = 10;
export const MAX_PROBLEM_SEARCH_LIMIT = 100;
export const MAX_PROBLEM_SEARCH_QUERY_LENGTH = 80;

const PROBLEM_SEARCH_MIN_LENGTH = 2;

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
  if (typeof query !== 'string') {
    return null;
  }

  const normalizedQuery = query.trim();
  if (normalizedQuery.length < PROBLEM_SEARCH_MIN_LENGTH) {
    return null;
  }

  if (normalizedQuery.length > MAX_PROBLEM_SEARCH_QUERY_LENGTH) {
    throw new Error('Search query is too long');
  }

  return normalizedQuery;
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
