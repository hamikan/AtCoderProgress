'use server';

import { getServerSession } from 'next-auth/next';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from './options';
import { revalidatePath } from 'next/cache';
import { fetchSubmission } from '@/lib/services/sync/submission/fetch';
import { fetchRatingHistory } from '@/lib/services/sync/rating/fetch';
import {
  applyAtCoderIdChange,
  getAtCoderIdChangeDecision,
  isAtCoderIdAvailableForUser,
} from '@/lib/services/db/user-atcoder-id';
import {
  AtCoderProfileFetchError,
  synchronizeAtCoderIdChange,
} from '@/lib/services/sync/atcoder-id-change';
import { normalizeAtCoderId } from '@/lib/validation/atcoder-id';

export async function linkAtCoderId(atcoderId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return {
      error: 'ログインが必要です。',
      success: false,
    };
  }

  let normalizedAtCoderId: string;
  try {
    normalizedAtCoderId = normalizeAtCoderId(atcoderId);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'AtCoder IDが不正です。',
      success: false,
    };
  }

  try {
    const userId = session.user.id;
    const decision = await getAtCoderIdChangeDecision(
      prisma,
      userId,
      normalizedAtCoderId,
      new Date()
    );

    if (decision.status === 'blocked') {
      const availableAt = new Intl.DateTimeFormat('ja-JP', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Tokyo',
      }).format(decision.availableAt);

      return {
        error: `AtCoder IDは${availableAt}以降に変更できます。`,
        success: false,
      };
    }

    if (decision.status === 'unchanged') {
      return { success: true };
    }

    const isAvailable = await isAtCoderIdAvailableForUser(
      prisma,
      userId,
      normalizedAtCoderId
    );
    if (!isAvailable) {
      return {
        error: 'このAtCoder IDはすでに登録されています。',
        success: false,
      };
    }

    const result = await synchronizeAtCoderIdChange(normalizedAtCoderId, {
      fetchSubmissions: fetchSubmission,
      fetchRatingHistory,
      commit: (profileData) => {
        const now = new Date();
        return prisma.$transaction(
          (transaction) =>
            applyAtCoderIdChange(
              transaction,
              userId,
              normalizedAtCoderId,
              now,
              profileData
            ),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          }
        );
      },
    });

    if (result.status === 'blocked') {
      const availableAt = new Intl.DateTimeFormat('ja-JP', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Tokyo',
      }).format(result.availableAt);

      return {
        error: `AtCoder IDは${availableAt}以降に変更できます。`,
        success: false,
      };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating user with AtCoder ID:', error);
    if (error instanceof AtCoderProfileFetchError) {
      return {
        error: 'AtCoderのデータ取得に失敗しました。AtCoder IDは変更されていません。',
        success: false,
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        error: 'このAtCoder IDはすでに登録されています。',
        success: false,
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return {
        error: '同時に更新が行われました。もう一度お試しください。',
        success: false,
      };
    }
    return {
      error: 'AtCoder IDの更新に失敗しました。',
      success: false,
    };
  }
}
