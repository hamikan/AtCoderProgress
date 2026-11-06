import 'server-only';

import { buildContestStats } from '@/features/problems/functions/contest-workspace';
import type { ContestKind, ContestStats } from '@/features/problems/types';
import { prisma } from '@/lib/prisma';

export async function getContestStatistics(
  contestType: ContestKind = 'abc',
  atcoderAccountId?: string | null
): Promise<ContestStats> {
  const problemRows = await prisma.contestProblem.findMany({
    where: { contestId: { startsWith: contestType } },
    select: { problemId: true },
    distinct: ['problemId'],
  });
  const problemIds = problemRows.map((row) => row.problemId);

  if (!atcoderAccountId || problemIds.length === 0) {
    return buildContestStats({
      total: problemIds.length,
      acCount: 0,
      tryingCount: 0,
    });
  }

  const [acRows, submittedRows] = await prisma.$transaction([
    prisma.submission.findMany({
      where: { atcoderAccountId, problemId: { in: problemIds }, result: 'AC' },
      select: { problemId: true },
      distinct: ['problemId'],
    }),
    prisma.submission.findMany({
      where: { atcoderAccountId, problemId: { in: problemIds } },
      select: { problemId: true },
      distinct: ['problemId'],
    }),
  ]);

  return buildContestStats({
    total: problemIds.length,
    acCount: acRows.length,
    tryingCount: submittedRows.length - acRows.length,
  });
}
