import 'server-only';

import { getSubmissionRefreshCursor } from '@/features/auth/functions/atcoder-data-refresh-policy';
import {
  AtCoderFullFetchPausedError,
  synchronizeAtCoderIdChange,
} from '@/features/auth/sync/synchronize-atcoder-id-change';
import type { AtCoderFullFetchResult } from '@/features/auth/types';
import { persistRatingHistoryInTransaction } from '@/features/ratings/sync/persist-rating-history';
import type { RatingHistoryWriterTransaction } from '@/features/ratings/types';
import { persistSubmissionsInTransaction } from '@/features/submissions/sync/persist-submissions';
import { fetchRatingHistory } from '@/lib/atcoder/ratings/fetch-rating-history';
import { fetchSubmissionPages } from '@/lib/atcoder/submissions/fetch-submissions';
import { createLogger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { LONG_TRANSACTION_OPTIONS } from '@/lib/prisma-transaction';

const logger = createLogger('atcoder-full-fetch');

type FullFetchTransaction = RatingHistoryWriterTransaction & {
  atCoderAccount: {
    update(args: {
      data: {
        name?: string;
        submissionsLastFetchedAt: Date;
        fetchStartedAt: null;
        fetchFailedAt: null;
      };
      where: { id: string };
    }): Promise<unknown>;
  };
  user: {
    updateMany(args: {
      data: { atcoderId: string };
      where: { atcoderId: { equals: string; mode: 'insensitive' } };
    }): Promise<unknown>;
  };
};

// 提出はページごとに保存済みなので、ここではレート履歴を保存して、取得が終わった印を付ける
export async function finishAtCoderFullFetch(
  transaction: FullFetchTransaction,
  atcoderAccountId: string,
  { ratingHistory, canonicalName }: AtCoderFullFetchResult,
  now: Date
): Promise<void> {
  await persistRatingHistoryInTransaction(transaction, atcoderAccountId, ratingHistory);

  await transaction.atCoderAccount.update({
    where: { id: atcoderAccountId },
    data: {
      ...(canonicalName ? { name: canonicalName } : {}),
      submissionsLastFetchedAt: now,
      fetchStartedAt: null,
      fetchFailedAt: null,
    },
  });
  if (canonicalName) {
    // 入力どおりの大文字小文字で連携した人の表示を、AtCoder 側の表記にそろえる
    await transaction.user.updateMany({
      where: { atcoderId: { equals: atcoderAccountId, mode: 'insensitive' } },
      data: { atcoderId: canonicalName },
    });
  }
}

// 前の実行が途中で止まっていたら、保存済みの一番新しい提出の近くから続ける
async function getFullFetchResumeCursor(atcoderAccountId: string): Promise<number> {
  const newest = { orderBy: { epochSecond: 'desc' }, select: { epochSecond: true } } as const;
  const [submission, pendingSubmission] = await Promise.all([
    prisma.submission.findFirst({ where: { atcoderAccountId }, ...newest }),
    prisma.pendingSubmission.findFirst({ where: { atcoderAccountId }, ...newest }),
  ]);
  const newestEpochSecond = Math.max(
    submission?.epochSecond ?? 0,
    pendingSubmission?.epochSecond ?? 0
  );
  return getSubmissionRefreshCursor(newestEpochSecond === 0 ? null : newestEpochSecond);
}

// 返事を返したあとに動くので、失敗は投げずに記録して、画面からやり直せるようにする
export async function runAtCoderFullFetch(
  atcoderAccountId: string,
  atcoderId: string
): Promise<void> {
  try {
    await synchronizeAtCoderIdChange(atcoderId, {
      getResumeCursor: () => getFullFetchResumeCursor(atcoderAccountId),
      fetchSubmissionPages,
      fetchRatingHistory,
      savePage: async (page) => {
        await prisma.$transaction(
          (transaction) => persistSubmissionsInTransaction(transaction, atcoderAccountId, page),
          LONG_TRANSACTION_OPTIONS
        );
      },
      commit: (result) =>
        prisma.$transaction(
          (transaction) => finishAtCoderFullFetch(transaction, atcoderAccountId, result, new Date()),
          LONG_TRANSACTION_OPTIONS
        ),
    });
    logger.info('finished', { atcoderAccountId });
  } catch (error) {
    if (error instanceof AtCoderFullFetchPausedError) {
      logger.info('paused at the time budget', {
        atcoderAccountId,
        savedPageCount: error.savedPageCount,
      });
    } else {
      logger.warn('failed', { atcoderAccountId, error });
    }
    // 別の取得が先に終わっていたら、失敗の印で上書きしない
    await prisma.atCoderAccount
      .updateMany({
        where: { id: atcoderAccountId, submissionsLastFetchedAt: null },
        data: { fetchStartedAt: null, fetchFailedAt: new Date() },
      })
      .catch((updateError: unknown) => {
        logger.error('could not record the failure', { atcoderAccountId, error: updateError });
      });
  }
}
