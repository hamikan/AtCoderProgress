import type { ContestKind, ContestOrder } from '@/types/contest';

export const DEFAULT_CONTEST_PAGE_SIZE = 100;
export const MAX_CONTEST_PAGE_SIZE = 100;

const CONTEST_KINDS = ['abc', 'arc', 'agc'] as const;
const CONTEST_ORDERS = ['asc', 'desc'] as const;

export function isContestKind(value: unknown): value is ContestKind {
  return typeof value === 'string' && CONTEST_KINDS.includes(value as ContestKind);
}

export function isContestOrder(value: unknown): value is ContestOrder {
  return typeof value === 'string' && CONTEST_ORDERS.includes(value as ContestOrder);
}

export function parseContestPageSize(value: string | null): number | null {
  if (!value) return DEFAULT_CONTEST_PAGE_SIZE;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_CONTEST_PAGE_SIZE) {
    return null;
  }

  return parsed;
}

export function validateContestCursor(cursor: string | null, contestType: ContestKind): boolean {
  if (!cursor) return true;
  return new RegExp(`^${contestType}\\d{3,}$`).test(cursor);
}
