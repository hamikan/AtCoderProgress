import {
  isContestKind,
  isContestOrder,
  isValidContestCursor,
} from './contest-page-params';
import type {
  ContestSearchParamsInput,
  NormalizedContestSearchParams,
} from '@/features/problems/types/input/contest-search-params';

export function normalizeContestSearchParams(
  params: ContestSearchParamsInput
): NormalizedContestSearchParams {
  const contestType = params.contestType?.toLowerCase();
  const order = params.order?.toLowerCase();

  const normalizedContestType = isContestKind(contestType) ? contestType : 'abc';
  const cursor = params.cursor ?? null;

  return {
    contestType: normalizedContestType,
    cursor: isValidContestCursor(cursor, normalizedContestType) ? cursor : null,
    order: isContestOrder(order) ? order : 'desc',
  };
}
