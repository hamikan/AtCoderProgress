import { toAtCoderAccountId } from '@/lib/atcoder/user-id';

export const ATCODER_ID_FETCH_INTERVAL_MS = 5 * 60 * 1000;

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

export function getAtCoderIdFetchIntervalStart(now: Date): Date {
  return new Date(now.getTime() - ATCODER_ID_FETCH_INTERVAL_MS);
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

  // データがある ID への切り替えは取り直さないので制限しない。新しい ID の全件取得だけ、前の取得から間をあける
  if (!needsFetch) {
    return { status: 'allowed' };
  }

  const intervalStart = getAtCoderIdFetchIntervalStart(now).getTime();
  const latestFetch = Math.max(
    ...recentFetchTimes.map((time) => time.getTime()),
    Number.NEGATIVE_INFINITY
  );
  if (latestFetch <= intervalStart) {
    return { status: 'allowed' };
  }

  return {
    availableAt: new Date(latestFetch + ATCODER_ID_FETCH_INTERVAL_MS),
    status: 'blocked',
  };
}
