'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { getAtCoderFetchStaleBefore } from '@/features/auth/functions/atcoder-fetch-status';
import { runAtCoderFullFetch } from '@/features/auth/sync/run-atcoder-full-fetch';
import type { LinkAtCoderIdError } from '@/features/auth/types';
import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/types/result';

export async function retryAtCoderFetch(): Promise<Result<null, LinkAtCoderIdError>> {
  const user = await getCurrentUser();
  if (!user?.atcoderId || !user.atcoderAccountId) {
    return {
      ok: false,
      error: { code: 'UNAUTHENTICATED', message: 'ログインしてAtCoder IDを連携してください。' },
    };
  }

  const { atcoderId, atcoderAccountId } = user;
  const now = new Date();
  try {
    await prisma.atCoderAccount.upsert({
      where: { id: atcoderAccountId },
      create: { id: atcoderAccountId, name: atcoderId },
      update: {},
    });
    // 取得中のものには触らない。データがまだない ID だけをやり直す
    const started = await prisma.atCoderAccount.updateMany({
      where: {
        id: atcoderAccountId,
        submissionsLastFetchedAt: null,
        OR: [
          { fetchStartedAt: null },
          { fetchStartedAt: { lte: getAtCoderFetchStaleBefore(now) } },
        ],
      },
      data: { fetchStartedAt: now, fetchFailedAt: null },
    });
    if (started.count === 1) {
      after(() => runAtCoderFullFetch(atcoderAccountId, atcoderId));
    }
  } catch (error) {
    console.error('Failed to retry the AtCoder fetch', { error, userId: user.id });
    return {
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'やり直しを始められませんでした。もう一度お試しください。' },
    };
  }

  revalidatePath('/');
  return { ok: true, value: null };
}
