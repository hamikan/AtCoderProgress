'use server';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import {
  DELETE_ACCOUNT_CONFIRMATION,
  isDeleteAccountConfirmed,
} from '@/features/auth/functions/delete-account-confirmation';
import type { DeleteAccountError } from '@/features/auth/types';
import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/types/result';

export async function deleteAccount(
  confirmation: string
): Promise<Result<{ status: 'deleted' }, DeleteAccountError>> {
  const user = await getCurrentUser();
  if (!user) {
    return failure('UNAUTHENTICATED', 'ログインが必要です。');
  }
  // 画面を通さずに呼ばれても消えないよう、確認の言葉はサーバー側でも確かめる
  if (!isDeleteAccountConfirmed(confirmation)) {
    return failure('NOT_CONFIRMED', `「${DELETE_ACCOUNT_CONFIRMATION}」と入力してください。`);
  }

  try {
    // 解法記録・ユーザータグ・ログイン方法などは DB の削除の連鎖で消え、★は持ち主を外して残る
    await prisma.user.delete({ where: { id: user.id } });
  } catch (error: unknown) {
    console.error('Failed to delete account', { error, userId: user.id });
    return failure('INTERNAL_ERROR', 'アカウントを削除できませんでした。時間をおいてもう一度お試しください。');
  }
  return { ok: true, value: { status: 'deleted' } };
}

function failure(
  code: DeleteAccountError['code'],
  message: string
): Result<never, DeleteAccountError> {
  return { ok: false, error: { code, message } as DeleteAccountError };
}
