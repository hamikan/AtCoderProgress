'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { parseSolutionId } from '@/features/solutions/schemas/solution';
import type { DeleteSolutionError } from '@/features/solutions/types';
import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/types/result';

interface DeleteSolutionValue {
  solutionId: string;
}

export async function deleteSolution(
  solutionId: unknown
): Promise<Result<DeleteSolutionValue, DeleteSolutionError>> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: { code: 'UNAUTHENTICATED', message: 'ログインが必要です。' },
    };
  }

  let parsedId: string;
  try {
    parsedId = parseSolutionId(solutionId);
  } catch {
    return {
      ok: false,
      error: { code: 'INVALID_INPUT', message: '消す記録が正しくありません。' },
    };
  }

  try {
    const { count } = await prisma.solution.deleteMany({
      where: { id: parsedId, userId: user.id },
    });
    if (count === 0) {
      return {
        ok: false,
        error: { code: 'NOT_FOUND', message: '消す記録が見つかりません。' },
      };
    }
  } catch (error: unknown) {
    console.error('Failed to delete solution', {
      error,
      userId: user.id,
      solutionId: parsedId,
    });
    return {
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: '記録を消せませんでした。' },
    };
  }

  revalidatePath('/solutions');
  revalidatePath(`/solutions/${parsedId}`);
  return { ok: true, value: { solutionId: parsedId } };
}
