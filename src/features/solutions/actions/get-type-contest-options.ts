'use server';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import {
  buildSidebarTypeContestOptions,
  getSidebarContestIdPrefix,
} from '@/features/solutions/functions/solution-sidebar-hierarchy';
import { parseContestType } from '@/features/solutions/schemas/solution';
import type {
  SolutionSidebarContestOption,
  SolutionSidebarLookupError,
} from '@/features/solutions/types';
import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/types/result';

export async function getTypeContestOptions(
  type: string
): Promise<Result<SolutionSidebarContestOption[], SolutionSidebarLookupError>> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: { code: 'UNAUTHENTICATED', message: 'ログインが必要です。' },
    };
  }

  let contestType: string;
  try {
    contestType = parseContestType(type);
  } catch {
    return {
      ok: false,
      error: { code: 'INVALID_INPUT', message: 'コンテストの種類が正しくありません。' },
    };
  }

  try {
    const contests = await prisma.contest.findMany({
      where: { id: { startsWith: getSidebarContestIdPrefix(contestType) } },
      select: { id: true },
    });

    return {
      ok: true,
      value: buildSidebarTypeContestOptions(
        contests.map((contest) => contest.id),
        contestType
      ),
    };
  } catch {
    return {
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'コンテストの一覧を読み込めませんでした。' },
    };
  }
}
