import 'server-only';

import { prisma } from '@/lib/prisma';
import type { ProblemDetail } from '@/features/problems/types';

export async function getProblemDetail(problemId: string): Promise<ProblemDetail | null> {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      contests: { include: { contest: { select: { startEpochSecond: true } } } },
    },
  });

  if (!problem) {
    return null;
  }

  // 元のコンテスト（ABC など）を先頭に置き、あとから同じ問題が出たコンテスト（ADT など）は新しい順に並べる
  const contests = [...problem.contests].sort(
    (left, right) =>
      Number(right.contestId === problem.firstContestId) -
        Number(left.contestId === problem.firstContestId) ||
      right.contest.startEpochSecond - left.contest.startEpochSecond ||
      left.contestId.localeCompare(right.contestId)
  );
  const primaryContest =
    contests.find((contest) => contest.contestId === problem.firstContestId) ??
    contests[0] ??
    null;

  return {
    id: problem.id,
    name: problem.name,
    difficulty: problem.difficulty,
    firstContest: { id: problem.firstContestId },
    problemIndex: primaryContest?.problemIndex ?? '',
    contests: contests.map(({ contestId, problemIndex }) => ({ contestId, problemIndex })),
  };
}
