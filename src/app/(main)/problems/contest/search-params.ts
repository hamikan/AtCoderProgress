import {
  isContestKind,
  isContestOrder,
} from '@/lib/validation/contest-page';
import type { ContestKind, ContestOrder } from '@/types/contest';

interface ContestSearchParamsInput {
  contestType?: string;
  order?: string;
}

export function normalizeContestSearchParams(params: ContestSearchParamsInput): {
  contestType: ContestKind;
  order: ContestOrder;
} {
  const contestType = params.contestType?.toLowerCase();
  const order = params.order?.toLowerCase();

  return {
    contestType: isContestKind(contestType) ? contestType : 'abc',
    order: isContestOrder(order) ? order : 'desc',
  };
}
