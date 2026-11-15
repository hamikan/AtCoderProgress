'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma/client';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { unlinkProvider as unlinkProviderInTransaction } from '@/features/auth/sync/unlink-provider';
import type { UnlinkProviderError } from '@/features/auth/types';
import { createLogger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/types/result';

const logger = createLogger('provider-unlink');

const LINKABLE_PROVIDERS = ['google', 'github'] as const;

export async function unlinkProvider(
  provider: string
): Promise<Result<{ status: 'unlinked' }, UnlinkProviderError>> {
  const user = await getCurrentUser();
  if (!user) {
    return failure('UNAUTHENTICATED', 'ログインが必要です。');
  }
  if (!(LINKABLE_PROVIDERS as readonly string[]).includes(provider)) {
    return failure('INVALID_INPUT', 'そのログイン方法は解除できません。');
  }

  try {
    // 別の画面から2つを同時に解除すると、どちらも「もう1つ残っている」と見て両方消えてしまうため
    const result = await prisma.$transaction(
      (transaction) => unlinkProviderInTransaction(transaction, user.id, provider),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
    if (result.status === 'not-linked') {
      return failure('NOT_LINKED', 'そのログイン方法は連携されていません。');
    }
    if (result.status === 'last-provider') {
      return failure('LAST_PROVIDER', '最後のログイン方法は解除できません。');
    }

    revalidatePath('/');
    return { ok: true, value: { status: 'unlinked' } };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      logger.warn('conflicted with another update', { userId: user.id, provider });
      return failure('CONFLICT', '同時に更新が行われました。もう一度お試しください。');
    }
    logger.error('failed', { userId: user.id, provider, error });
    return failure('INTERNAL_ERROR', 'ログイン方法の解除に失敗しました。');
  }
}

function failure(
  code: UnlinkProviderError['code'],
  message: string
): Result<never, UnlinkProviderError> {
  return { ok: false, error: { code, message } as UnlinkProviderError };
}
