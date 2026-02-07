'use server';

import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from './options';
import { revalidatePath } from 'next/cache';
import { syncSubmission } from '@/lib/services/sync/submission';

export async function linkAtCoderId(atcoderId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error('Unauthorized');
  }

  if (!atcoderId || typeof atcoderId !== 'string') {
    throw new Error('AtCoder ID is required');
  }

  try {
    const userId = session.user.id;
    await prisma.user.update({
      where: { id: userId },
      data: { atcoderId: atcoderId },
    });
    
    // 初回同期をバックグラウンドで開始 (awaitしない)
    // ユーザーは即座にダッシュボードへ遷移できる
    syncSubmission(userId, atcoderId, 0).catch(error => {
      console.error('Background initial sync failed:', error);
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user with AtCoder ID:', error);
    if (error.code === 'P2002') {
      throw new Error('This AtCoder ID is already taken.');
    }
    throw new Error('Failed to update AtCoder ID');
  }
}
