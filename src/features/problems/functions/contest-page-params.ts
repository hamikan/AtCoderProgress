import type { ContestKind, ContestOrder } from '@/features/problems/types';
import {
  contestKindSchema,
  contestOrderSchema,
} from '@/features/problems/schemas/problem-input';

export const DEFAULT_CONTEST_PAGE_SIZE = 100;
export const MAX_CONTEST_PAGE_SIZE = 100;

export function isContestKind(value: unknown): value is ContestKind {
  return contestKindSchema.safeParse(value).success;
}

export function isContestOrder(value: unknown): value is ContestOrder {
  return contestOrderSchema.safeParse(value).success;
}

export function parseContestPageSize(value: string | null): number | null {
  if (!value) return DEFAULT_CONTEST_PAGE_SIZE;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_CONTEST_PAGE_SIZE) {
    return null;
  }

  return parsed;
}

export function isValidContestCursor(cursor: string | null, contestType: ContestKind): boolean {
  if (!cursor) return true;
  return new RegExp(`^${contestType}\\d{3,}$`).test(cursor);
}
