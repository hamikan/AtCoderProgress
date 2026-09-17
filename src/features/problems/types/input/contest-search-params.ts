import type { ContestKind, ContestOrder } from '../output/contest';

export interface ContestSearchParamsInput {
  contestType?: string;
  cursor?: string;
  order?: string;
}

export interface NormalizedContestSearchParams {
  contestType: ContestKind;
  cursor: string | null;
  order: ContestOrder;
}
