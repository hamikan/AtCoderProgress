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
import { createLogger } from '@/lib/logger';

const logger = createLogger('atcoder-refresh');

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

    const [submissions, ratings] = await Promise.allSettled([
      syncSubmissions(atcoderId, fromSecond),
      syncRatingHistory(atcoderId),
    ]);
    if (submissions.status === 'fulfilled') {
      logger.info('refreshed submissions', { atcoderAccountId, ...submissions.value });
    } else {
      logger.warn('could not refresh submissions', { atcoderAccountId, error: submissions.reason });
    }
    if (ratings.status === 'rejected') {
      logger.warn('could not refresh the rating history', { atcoderAccountId, error: ratings.reason });
    }
  } catch (error) {
    logger.warn('failed', { atcoderAccountId, error });
  } finally {
    refreshInFlight.delete(atcoderAccountId);
  }
}
