export type AtCoderFetchStatus = 'ready' | 'fetching' | 'failed';

export interface AtCoderFetchState {
  submissionsLastFetchedAt: Date | null;
  fetchStartedAt: Date | null;
  fetchFailedAt: Date | null;
}
