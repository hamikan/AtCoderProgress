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
}

interface UserAtCoderIdTransaction
  extends UserAtCoderIdReader,
    SubmissionWriterTransaction,
    RatingHistoryWriterTransaction {
  user: UserAtCoderIdReader['user'] & {
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
}

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

  return decideAtCoderIdChange(
    user.atcoderId,
    user.atcoderIdChangedAt,
    nextAtCoderId,
    now
  );
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
