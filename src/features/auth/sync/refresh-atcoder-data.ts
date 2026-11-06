import 'server-only';

import { prisma } from '@/lib/prisma';
import {
  getSubmissionRefreshCursor,
  shouldRefreshAtCoderData,
} from '@/features/auth/functions/atcoder-data-refresh-policy';
import { getAtCoderFetchStatus } from '@/features/auth/functions/atcoder-fetch-status';
import { syncRatingHistory } from '@/features/ratings/sync/sync-rating-history';
import { syncSubmissions } from '@/features/submissions/sync/sync-submissions';
import { toAtCoderAccountId } from '@/lib/atcoder/user-id';

// 同じプロセスの中での重複だけを防ぐ（別のサーバーインスタンスでは同時に走りうる）
const refreshInFlight = new Set<string>();

export async function refreshAtCoderDataIfStale(atcoderId: string): Promise<void> {
  const atcoderAccountId = toAtCoderAccountId(atcoderId);
  if (refreshInFlight.has(atcoderAccountId)) {
    return;
  }
  refreshInFlight.add(atcoderAccountId);

  try {
    const account = await prisma.atCoderAccount.findUnique({
      where: { id: atcoderAccountId },
      select: {
        submissionsLastFetchedAt: true,
        fetchStartedAt: true,
        fetchFailedAt: true,
      },
    });
    const now = new Date();
    // 全件の取得がまだ終わっていない ID は、裏の取得（とやり直し）に任せて、ここでは取らない
    if (
      getAtCoderFetchStatus(account, now) !== 'ready' ||
      !shouldRefreshAtCoderData(account?.submissionsLastFetchedAt ?? null, now)
    ) {
      return;
    }

    const latestSubmission = await prisma.submission.findFirst({
      where: { atcoderAccountId },
      orderBy: { epochSecond: 'desc' },
      select: { epochSecond: true },
    });
    const fromSecond = getSubmissionRefreshCursor(
      latestSubmission?.epochSecond ?? null
    );

    const results = await Promise.allSettled([
      syncSubmissions(atcoderId, fromSecond),
      syncRatingHistory(atcoderId),
    ]);
    for (const result of results) {
      if (result.status === 'rejected') {
        console.warn('[atcoder-refresh] sync failed', result.reason);
      }
    }
  } catch (error) {
    console.warn('[atcoder-refresh] failed', error);
  } finally {
    refreshInFlight.delete(atcoderAccountId);
  }
}
