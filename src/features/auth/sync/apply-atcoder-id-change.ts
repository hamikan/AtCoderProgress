import 'server-only';

import { decideAtCoderIdChange } from '@/features/auth/functions/atcoder-id-change-policy';
import type {
  ApplyAtCoderIdChangeResult,
  AtCoderProfileData,
} from '@/features/auth/types';
import { persistRatingHistoryInTransaction } from '@/features/ratings/sync/persist-rating-history';
import type { RatingHistoryWriterTransaction } from '@/features/ratings/types';
import { persistSubmissionsInTransaction } from '@/features/submissions/sync/persist-submissions';
import type { SubmissionWriterTransaction } from '@/features/submissions/types';

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

interface AtCoderIdOwnerReader {
  user: {
    findUnique(args: {
      select: { id: true };
      where: { atcoderId: string };
    }): Promise<{ id: string } | null>;
  };
}

interface UserAtCoderIdTransaction extends UserAtCoderIdReader {
  user: UserAtCoderIdReader['user'] & {
    update(args: {
      data: {
        atcoderId: string;
        atcoderIdChangedAt: Date;
        submissionsLastFetchedAt: Date;
      };
      where: { id: string };
    }): Promise<unknown>;
  };
  problem: SubmissionWriterTransaction['problem'];
  submission: SubmissionWriterTransaction['submission'] & {
    deleteMany(args: { where: { userId: string } }): Promise<unknown>;
  };
  userRatingHistory: RatingHistoryWriterTransaction['userRatingHistory'] & {
    deleteMany(args: { where: { userId: string } }): Promise<unknown>;
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

  return {
    decision: decideAtCoderIdChange(
      user.atcoderId,
      user.atcoderIdChangedAt,
      nextAtCoderId,
      now
    ),
    user,
  };
}

export async function getAtCoderIdChangeDecision(
  reader: UserAtCoderIdReader,
  userId: string,
  nextAtCoderId: string,
  now: Date
) {
  const { decision } = await readAtCoderIdChange(
    reader,
    userId,
    nextAtCoderId,
    now
  );
  return decision;
}

export async function isAtCoderIdAvailableForUser(
  reader: AtCoderIdOwnerReader,
  userId: string,
  atcoderId: string
): Promise<boolean> {
  const owner = await reader.user.findUnique({
    where: { atcoderId },
    select: { id: true },
  });
  return !owner || owner.id === userId;
}

export async function applyAtCoderIdChange(
  transaction: UserAtCoderIdTransaction,
  userId: string,
  nextAtCoderId: string,
  now: Date,
  profileData: AtCoderProfileData
): Promise<ApplyAtCoderIdChangeResult> {
  const { decision, user } = await readAtCoderIdChange(
    transaction,
    userId,
    nextAtCoderId,
    now
  );
  if (decision.status !== 'allowed') {
    return decision;
  }

  await transaction.user.update({
    where: { id: userId },
    data: {
      atcoderId: nextAtCoderId,
      atcoderIdChangedAt: now,
      submissionsLastFetchedAt: now,
    },
  });

  if (user.atcoderId) {
    await transaction.submission.deleteMany({
      where: { userId },
    });
    await transaction.userRatingHistory.deleteMany({
      where: { userId },
    });
  }

  await persistSubmissionsInTransaction(
    transaction,
    userId,
    profileData.submissionData
  );
  await persistRatingHistoryInTransaction(
    transaction,
    userId,
    profileData.ratingHistory
  );

  return { status: 'changed' };
}
