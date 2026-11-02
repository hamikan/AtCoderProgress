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
  /**
   * Optional: when present, a blocked change is still allowed if the
   * previous link produced no submissions and no rating history at
   * all (issue #112).
   */
  submission?: {
    count(args: { where: { userId: string } }): Promise<number>;
  };
  userRatingHistory?: {
    count(args: { where: { userId: string } }): Promise<number>;
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
    count(args: { where: { userId: string } }): Promise<number>;
  };
  userRatingHistory: RatingHistoryWriterTransaction['userRatingHistory'] & {
    deleteMany(args: { where: { userId: string } }): Promise<unknown>;
    count(args: { where: { userId: string } }): Promise<number>;
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

  let decision = decideAtCoderIdChange(
    user.atcoderId,
    user.atcoderIdChangedAt,
    nextAtCoderId,
    now
  );

  if (
    decision.status === 'blocked' &&
    reader.submission &&
    reader.userRatingHistory
  ) {
    const [submissionCount, ratingHistoryCount] = await Promise.all([
      reader.submission.count({ where: { userId } }),
      reader.userRatingHistory.count({ where: { userId } }),
    ]);
    if (submissionCount + ratingHistoryCount === 0) {
      // The previous link produced no data at all — typically a typo
      // or a nonexistent ID. Locking the user out for 7 days over a
      // link that brought nothing helps no one (issue #112).
      decision = { status: 'allowed' };
    }
  }

  return {
    decision,
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
