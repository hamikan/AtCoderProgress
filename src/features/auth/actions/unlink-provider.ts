'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { unlinkProvider as unlinkProviderInTransaction } from '@/features/auth/sync/unlink-provider';
import type { UnlinkProviderError } from '@/features/auth/types';
import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/types/result';

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
    const result = await prisma.$transaction((transaction) =>
      unlinkProviderInTransaction(transaction, user.id, provider)
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
    console.error('Failed to unlink provider', { error, userId: user.id });
    return failure('INTERNAL_ERROR', 'ログイン方法の解除に失敗しました。');
  }
}

function failure(
  code: UnlinkProviderError['code'],
  message: string
): Result<never, UnlinkProviderError> {
  return { ok: false, error: { code, message } as UnlinkProviderError };
}
