'use server';

import { getServerSession } from 'next-auth/next';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from './options';
import { revalidatePath } from 'next/cache';
import { syncSubmission } from '@/lib/services/sync/submission';
import { normalizeAtCoderId } from '@/lib/validation/atcoder-id';

export async function linkAtCoderId(atcoderId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error('Unauthorized');
  }

  const normalizedAtCoderId = normalizeAtCoderId(atcoderId);

  try {
    const userId = session.user.id;
    await prisma.user.update({
      where: { id: userId },
      data: { atcoderId: normalizedAtCoderId },
    });
    
    // 初回同期をバックグラウンドで開始 (awaitしない)
    // ユーザーは即座にダッシュボードへ遷移できる
    syncSubmission(userId, normalizedAtCoderId, 0).catch(error => {
      console.error('Background initial sync failed:', error);
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating user with AtCoder ID:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('This AtCoder ID is already taken.');
    }
    throw new Error('Failed to update AtCoder ID');
  }
}
