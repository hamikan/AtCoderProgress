import 'server-only';

import { prisma } from '@/lib/prisma';
import type { ProblemDetail } from '@/features/problems/types';

export async function getProblemDetail(problemId: string): Promise<ProblemDetail | null> {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { contests: true },
  });

  if (!problem) {
    return null;
  }

  const contests = [...problem.contests].sort((left, right) =>
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
