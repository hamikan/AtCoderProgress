'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma/client';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { parseAtCoderId } from '@/features/auth/schemas/atcoder-id';
import {
  applyAtCoderIdChange,
  getAtCoderIdChangeDecision,
} from '@/features/auth/sync/apply-atcoder-id-change';
import {
  AtCoderProfileFetchError,
  synchronizeAtCoderIdChange,
} from '@/features/auth/sync/synchronize-atcoder-id-change';
import type {
  AtCoderProfileData,
  LinkAtCoderIdError,
} from '@/features/auth/types';
import { fetchRatingHistory } from '@/lib/atcoder/ratings/fetch-rating-history';
import { fetchSubmissions } from '@/lib/atcoder/submissions/fetch-submissions';
import { toAtCoderAccountId } from '@/lib/atcoder/user-id';
import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/types/result';

interface LinkAtCoderIdValue {
  status: 'linked' | 'unchanged';
}

export async function linkAtCoderId(
  atcoderId: string
): Promise<Result<LinkAtCoderIdValue, LinkAtCoderIdError>> {
  const user = await getCurrentUser();
  if (!user) {
    return failure('UNAUTHENTICATED', 'ログインが必要です。');
  }

  let parsedAtCoderId: string;
  try {
    parsedAtCoderId = parseAtCoderId(atcoderId);
  } catch (error) {
    return failure(
      'INVALID_INPUT',
      error instanceof Error ? error.message : 'AtCoder IDが不正です。'
    );
  }

  try {
    const decision = await getAtCoderIdChangeDecision(
      prisma,
      user.id,
      parsedAtCoderId,
      new Date()
    );

    if (decision.status === 'blocked') {
      return failure('CHANGE_BLOCKED', formatChangeBlockedMessage(decision.availableAt));
    }
    if (decision.status === 'unchanged') {
      return { ok: true, value: { status: 'unchanged' } };
    }

    const commit = (profileData: AtCoderProfileData | null) => {
      const now = new Date();
      return prisma.$transaction(
        (transaction) =>
          applyAtCoderIdChange(
            transaction,
            user.id,
            parsedAtCoderId,
            now,
            profileData
          ),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    };
    const existingAccount = await prisma.atCoderAccount.findUnique({
      where: { id: toAtCoderAccountId(parsedAtCoderId) },
      select: { submissionsLastFetchedAt: true },
    });
    // すでに誰かが取ってある ID なら全件は取り直さない。新しい分はダッシュボードを開いたときの更新で入る
    const result = existingAccount?.submissionsLastFetchedAt
      ? await commit(null)
      : await synchronizeAtCoderIdChange(parsedAtCoderId, {
          fetchSubmissions,
          fetchRatingHistory,
          commit,
        });

    if (result.status === 'blocked') {
      return failure('CHANGE_BLOCKED', formatChangeBlockedMessage(result.availableAt));
    }

    revalidatePath('/');
    return {
      ok: true,
      value: { status: result.status === 'unchanged' ? 'unchanged' : 'linked' },
    };
  } catch (error: unknown) {
    console.error('Failed to link AtCoder ID', { error, userId: user.id });

    if (error instanceof AtCoderProfileFetchError) {
      return failure(
        'UPSTREAM_UNAVAILABLE',
        'AtCoderのデータ取得に失敗しました。AtCoder IDは変更されていません。'
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return failure('CONFLICT', '同時に更新が行われました。もう一度お試しください。');
    }
    return failure('INTERNAL_ERROR', 'AtCoder IDの更新に失敗しました。');
  }
}

function failure(
  code: LinkAtCoderIdError['code'],
  message: string
): Result<never, LinkAtCoderIdError> {
  return { ok: false, error: { code, message } as LinkAtCoderIdError };
}

function formatChangeBlockedMessage(availableAt: Date): string {
  const formatted = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Tokyo',
  }).format(availableAt);
  return `AtCoder IDは${formatted}以降に変更できます。`;
}
