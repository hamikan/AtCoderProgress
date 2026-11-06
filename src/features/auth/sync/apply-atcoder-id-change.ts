import 'server-only';

import { decideAtCoderIdChange } from '@/features/auth/functions/atcoder-id-change-policy';
import type {
  ApplyAtCoderIdChangeResult,
  AtCoderProfileData,
} from '@/features/auth/types';
import { persistRatingHistoryInTransaction } from '@/features/ratings/sync/persist-rating-history';
import type { RatingHistoryWriterTransaction } from '@/features/ratings/types';
import {
  getCanonicalAtCoderName,
  persistSubmissionsInTransaction,
} from '@/features/submissions/sync/persist-submissions';
import type { SubmissionWriterTransaction } from '@/features/submissions/types';
import { toAtCoderAccountId } from '@/lib/atcoder/user-id';

interface UserAtCoderIdReader {
  user: {
    findUnique(args: {
      select: {
        atcoderId: true;
        atcoderIdChangedAt: true;
      };
      where: { id: string };
    }): Promise<{
      atcoderId: string | null;
      atcoderIdChangedAt: Date | null;
    } | null>;
  };
  submission: {
    count(args: { where: { atcoderAccountId: string } }): Promise<number>;
  };
  userRatingHistory: {
    count(args: { where: { atcoderAccountId: string } }): Promise<number>;
  };
}

type UserAtCoderIdTransaction = UserAtCoderIdReader &
  SubmissionWriterTransaction &
  RatingHistoryWriterTransaction & {
  user: {
    update(args: {
      data: {
        atcoderId: string;
        atcoderIdChangedAt: Date;
      };
      where: { id: string };
    }): Promise<unknown>;
  };
  atCoderAccount: {
    upsert(args: {
      create: {
        id: string;
        name: string;
        submissionsLastFetchedAt: Date | null;
      };
      select: { name: true };
      update: { name?: string; submissionsLastFetchedAt?: Date };
      where: { id: string };
    }): Promise<{ name: string }>;
  };
};

async function readAtCoderIdChange(
  reader: UserAtCoderIdReader,
  userId: string,
  nextAtCoderId: string,
  now: Date
) {
  const user = await reader.user.findUnique({
    where: { id: userId },
    select: {
      atcoderId: true,
      atcoderIdChangedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const decision = decideAtCoderIdChange(
    user.atcoderId,
    user.atcoderIdChangedAt,
    nextAtCoderId,
    now
  );
  if (decision.status !== 'blocked' || !user.atcoderId) {
    return decision;
  }

  // 提出もレート履歴も1件もない ID（打ち間違いなど）で、7日間変えられなくなるのを防ぐ
  const atcoderAccountId = toAtCoderAccountId(user.atcoderId);
  const [submissionCount, ratingHistoryCount] = await Promise.all([
    reader.submission.count({ where: { atcoderAccountId } }),
    reader.userRatingHistory.count({ where: { atcoderAccountId } }),
  ]);
  return submissionCount + ratingHistoryCount === 0
    ? { status: 'allowed' as const }
    : decision;
}

export async function getAtCoderIdChangeDecision(
  reader: UserAtCoderIdReader,
  userId: string,
  nextAtCoderId: string,
  now: Date
) {
  return readAtCoderIdChange(reader, userId, nextAtCoderId, now);
}

// profileData が null のときは、その ID のデータがすでにあるので取り直さずに連携だけを切り替える
export async function applyAtCoderIdChange(
  transaction: UserAtCoderIdTransaction,
  userId: string,
  nextAtCoderId: string,
  now: Date,
  profileData: AtCoderProfileData | null
): Promise<ApplyAtCoderIdChangeResult> {
  const decision = await readAtCoderIdChange(
    transaction,
    userId,
    nextAtCoderId,
    now
  );
  if (decision.status !== 'allowed') {
    return decision;
  }

  const atcoderAccountId = toAtCoderAccountId(nextAtCoderId);
  const canonicalName = profileData
    ? getCanonicalAtCoderName(profileData.submissionData)
    : null;
  const account = await transaction.atCoderAccount.upsert({
    where: { id: atcoderAccountId },
    create: {
      id: atcoderAccountId,
      name: canonicalName ?? nextAtCoderId,
      submissionsLastFetchedAt: profileData ? now : null,
    },
    update: {
      ...(canonicalName ? { name: canonicalName } : {}),
      ...(profileData ? { submissionsLastFetchedAt: now } : {}),
    },
    select: { name: true },
  });

  if (profileData) {
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
  }

  await transaction.user.update({
    where: { id: userId },
    data: {
      atcoderId: account.name,
      atcoderIdChangedAt: now,
    },
  });

  return { status: 'changed' };
}
