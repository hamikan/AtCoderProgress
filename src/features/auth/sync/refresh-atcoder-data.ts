import 'server-only';

import { prisma } from '@/lib/prisma';
import {
  getSubmissionRefreshCursor,
  shouldRefreshAtCoderData,
} from '@/features/auth/functions/atcoder-data-refresh-policy';
import { syncRatingHistory } from '@/features/ratings/sync/sync-rating-history';
import { syncSubmissions } from '@/features/submissions/sync/sync-submissions';

const refreshInFlight = new Set<string>();

/**
 * Refreshes a linked user's submissions and rating history when the
 * last fetch is stale (issue #109). Called from the dashboard load;
 * failures are logged and swallowed so the page still renders with
 * the data already stored. While a refresh for the user is running in
 * this process, further calls are skipped.
 */
export async function refreshAtCoderDataIfStale(userId: string): Promise<void> {
  if (refreshInFlight.has(userId)) {
    return;
  }
  refreshInFlight.add(userId);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { atcoderId: true, submissionsLastFetchedAt: true },
    });
    if (!user?.atcoderId) {
      return;
    }
    if (!shouldRefreshAtCoderData(user.submissionsLastFetchedAt, new Date())) {
      return;
    }

    const latestSubmission = await prisma.submission.findFirst({
      where: { userId },
      orderBy: { epochSecond: 'desc' },
      select: { epochSecond: true },
    });
    const fromSecond = getSubmissionRefreshCursor(
      latestSubmission?.epochSecond ?? null
    );

    const results = await Promise.allSettled([
      syncSubmissions(userId, user.atcoderId, fromSecond),
      syncRatingHistory(userId, user.atcoderId),
    ]);
    for (const result of results) {
      if (result.status === 'rejected') {
        console.warn('[atcoder-refresh] sync failed', result.reason);
      }
    }
  } catch (error) {
    console.warn('[atcoder-refresh] failed', error);
  } finally {
    refreshInFlight.delete(userId);
  }
}
