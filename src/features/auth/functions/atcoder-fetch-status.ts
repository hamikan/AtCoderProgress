import type { AtCoderFetchState, AtCoderFetchStatus } from '@/features/auth/types';

export const ATCODER_FULL_FETCH_STALE_MS = 10 * 60 * 1000;

export function getAtCoderFetchStaleBefore(now: Date): Date {
  return new Date(now.getTime() - ATCODER_FULL_FETCH_STALE_MS);
}

export function getAtCoderFetchStatus(
  state: AtCoderFetchState | null,
  now: Date
): AtCoderFetchStatus {
  if (!state) {
    return 'failed';
  }
  if (state.fetchStartedAt) {
    // サーバーが途中で止まると取得中のまま残るので、長すぎるものは失敗とみなしてやり直せるようにする
    return state.fetchStartedAt > getAtCoderFetchStaleBefore(now) ? 'fetching' : 'failed';
  }
  if (state.fetchFailedAt) {
    return 'failed';
  }
  return state.submissionsLastFetchedAt ? 'ready' : 'failed';
}
