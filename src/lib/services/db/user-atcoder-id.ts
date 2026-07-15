import { decideAtCoderIdChange } from '@/lib/auth/atcoder-id-change-policy';
import type { AtCoderProfileData } from '@/lib/services/sync/atcoder-id-change';
import {
  persistRatingHistoryInTransaction,
  type RatingHistoryPersistenceTransaction,
} from '@/lib/services/sync/rating/persist';
import {
  persistSubmissionDataInTransaction,
  type SubmissionPersistenceTransaction,
} from '@/lib/services/sync/submission/persist';

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
  problem: SubmissionPersistenceTransaction['problem'];
  submission: SubmissionPersistenceTransaction['submission'] & {
    deleteMany(args: { where: { userId: string } }): Promise<unknown>;
  };
  userRatingHistory: RatingHistoryPersistenceTransaction['userRatingHistory'] & {
    deleteMany(args: { where: { userId: string } }): Promise<unknown>;
  };
}

export type ApplyAtCoderIdChangeResult =
  | {
      status: 'changed';
    }
  | {
      availableAt: Date;
      status: 'blocked';
    }
  | {
      status: 'unchanged';
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

  await persistSubmissionDataInTransaction(
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
