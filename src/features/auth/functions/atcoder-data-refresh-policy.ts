export const ATCODER_DATA_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// ジャッジ中に保存した提出の確定結果を拾うため、最新の提出の1日前から取り直す
export const SUBMISSION_REFRESH_OVERLAP_SECONDS = 24 * 60 * 60;

export function shouldRefreshAtCoderData(
  lastFetchedAt: Date | null,
  now: Date
): boolean {
  if (!lastFetchedAt) {
    return true;
  }
  return (
    now.getTime() - lastFetchedAt.getTime() >=
    ATCODER_DATA_REFRESH_INTERVAL_MS
  );
}

export function getSubmissionRefreshCursor(
  latestEpochSecond: number | null
): number {
  if (latestEpochSecond === null) {
    return 0;
  }
  return Math.max(0, latestEpochSecond - SUBMISSION_REFRESH_OVERLAP_SECONDS);
}
