import { toAtCoderAccountId } from '@/lib/atcoder/user-id';

export const ATCODER_ID_FETCH_LIMIT = 3;
export const ATCODER_ID_FETCH_WINDOW_MS = 24 * 60 * 60 * 1000;

type AtCoderIdChangeDecision =
  | {
      status: 'allowed';
    }
  | {
      availableAt: Date;
      status: 'blocked';
    }
  | {
      status: 'unchanged';
    };

export function getAtCoderIdFetchWindowStart(now: Date): Date {
  return new Date(now.getTime() - ATCODER_ID_FETCH_WINDOW_MS);
}

export function decideAtCoderIdChange({
  currentAtCoderId,
  nextAtCoderId,
  needsFetch,
  recentFetchTimes,
  now,
}: {
  currentAtCoderId: string | null;
  nextAtCoderId: string;
  needsFetch: boolean;
  recentFetchTimes: Date[];
  now: Date;
}): AtCoderIdChangeDecision {
  if (
    currentAtCoderId !== null &&
    toAtCoderAccountId(currentAtCoderId) === toAtCoderAccountId(nextAtCoderId)
  ) {
    return { status: 'unchanged' };
  }

  // データがある ID への切り替えは取り直さないので制限しない。数えるのは新しい ID の全件取得だけ
  if (!needsFetch) {
    return { status: 'allowed' };
  }

  const windowStart = getAtCoderIdFetchWindowStart(now).getTime();
  const recent = recentFetchTimes
    .map((time) => time.getTime())
    .filter((time) => time > windowStart)
    .toSorted((left, right) => left - right);
  if (recent.length < ATCODER_ID_FETCH_LIMIT) {
    return { status: 'allowed' };
  }

  return {
    availableAt: new Date(
      recent[recent.length - ATCODER_ID_FETCH_LIMIT] + ATCODER_ID_FETCH_WINDOW_MS
    ),
    status: 'blocked',
  };
}
