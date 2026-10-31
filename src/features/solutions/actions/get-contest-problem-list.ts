'use server';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { findSidebarContestProblems } from '@/features/solutions/api/get-sidebar-contest-problems';
import { parseContestId } from '@/features/solutions/schemas/solution';
import type {
  SolutionSidebarContestProblem,
  SolutionSidebarLookupError,
} from '@/features/solutions/types';
import type { Result } from '@/lib/types/result';

export async function getContestProblemList(
  contestId: string
): Promise<Result<SolutionSidebarContestProblem[], SolutionSidebarLookupError>> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: { code: 'UNAUTHENTICATED', message: 'ログインが必要です。' },
    };
  }

  let parsedContestId: string;
  try {
    parsedContestId = parseContestId(contestId);
  } catch {
    return {
      ok: false,
      error: { code: 'INVALID_INPUT', message: 'コンテストが正しくありません。' },
    };
  }

  try {
    return {
      ok: true,
      value: await findSidebarContestProblems({ contestId: parsedContestId }),
    };
  } catch {
    return {
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: '問題の一覧を読み込めませんでした。' },
    };
  }
}
