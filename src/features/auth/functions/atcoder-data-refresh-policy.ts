/**
 * Policy for the periodic refresh of a linked user's AtCoder data
 * (issue #109). Submissions and rating history used to be fetched only
 * once, when the AtCoder ID was linked.
 */

/** How long fetched data counts as fresh. */
export const ATCODER_DATA_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

/**
 * How far back a differential submission fetch reaches from the
 * newest stored submission. Re-fetching the last day lets final judge
 * results replace the ones saved while judging.
 */
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

/**
 * The `from_second` cursor for a differential submission fetch: one
 * day before the newest stored submission, or 0 (full fetch) when
 * nothing is stored yet.
 */
export function getSubmissionRefreshCursor(
  latestEpochSecond: number | null
): number {
  if (latestEpochSecond === null) {
    return 0;
  }
  return Math.max(0, latestEpochSecond - SUBMISSION_REFRESH_OVERLAP_SECONDS);
}
