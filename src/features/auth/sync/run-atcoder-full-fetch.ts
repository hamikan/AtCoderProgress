import 'server-only';

import { synchronizeAtCoderIdChange } from '@/features/auth/sync/synchronize-atcoder-id-change';
import type { AtCoderProfileData } from '@/features/auth/types';
import { persistRatingHistoryInTransaction } from '@/features/ratings/sync/persist-rating-history';
import type { RatingHistoryWriterTransaction } from '@/features/ratings/types';
import {
  getCanonicalAtCoderName,
  persistSubmissionsInTransaction,
} from '@/features/submissions/sync/persist-submissions';
import type { SubmissionWriterTransaction } from '@/features/submissions/types';
import { fetchRatingHistory } from '@/lib/atcoder/ratings/fetch-rating-history';
import { fetchSubmissions } from '@/lib/atcoder/submissions/fetch-submissions';
import { createLogger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const logger = createLogger('atcoder-full-fetch');

type FullFetchTransaction = SubmissionWriterTransaction &
  RatingHistoryWriterTransaction & {
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

export async function finishAtCoderFullFetch(
  transaction: FullFetchTransaction,
  atcoderAccountId: string,
  profileData: AtCoderProfileData,
  now: Date
): Promise<void> {
  await persistSubmissionsInTransaction(
    transaction,
    atcoderAccountId,
    profileData.submissionData
  );
  await persistRatingHistoryInTransaction(
    transaction,
    atcoderAccountId,
    profileData.ratingHistory
  );

  const canonicalName = getCanonicalAtCoderName(profileData.submissionData);
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

// 返事を返したあとに動くので、失敗は投げずに記録して、画面からやり直せるようにする
export async function runAtCoderFullFetch(
  atcoderAccountId: string,
  atcoderId: string
): Promise<void> {
  try {
    await synchronizeAtCoderIdChange(atcoderId, {
      fetchSubmissions,
      fetchRatingHistory,
      commit: (profileData) =>
        prisma.$transaction((transaction) =>
          finishAtCoderFullFetch(transaction, atcoderAccountId, profileData, new Date())
        ),
    });
    logger.info('finished', { atcoderAccountId });
  } catch (error) {
    logger.warn('failed', { atcoderAccountId, error });
    await prisma.atCoderAccount
      .update({
        where: { id: atcoderAccountId },
        data: { fetchStartedAt: null, fetchFailedAt: new Date() },
      })
      .catch((updateError: unknown) => {
        logger.error('could not record the failure', { atcoderAccountId, error: updateError });
      });
  }
}
