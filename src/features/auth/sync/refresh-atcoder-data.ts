import 'server-only';

import { prisma } from '@/lib/prisma';
import {
  getSubmissionRefreshCursor,
  shouldRefreshAtCoderData,
} from '@/features/auth/functions/atcoder-data-refresh-policy';
import { syncRatingHistory } from '@/features/ratings/sync/sync-rating-history';
import { syncSubmissions } from '@/features/submissions/sync/sync-submissions';

// 同じプロセスの中での重複だけを防ぐ（別のサーバーインスタンスでは同時に走りうる）
const refreshInFlight = new Set<string>();

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
