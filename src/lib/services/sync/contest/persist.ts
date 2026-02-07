import { prisma } from '@/lib/prisma';
import type { NormalizedContestData } from './types';

export async function persistContestData(data: NormalizedContestData) {
  const { contests, problems, contestProblems } = data;

  await prisma.$transaction(async (tx) => {
    for (const contest of contests) {
      await tx.contest.upsert({
        where: { id: contest.id },
        update: {
          startEpochSecond: contest.startEpochSecond,
          durationSecond: contest.durationSecond,
        },
        create: {
          id: contest.id,
          startEpochSecond: contest.startEpochSecond,
          durationSecond: contest.durationSecond,
        },
      });
    }

    for (const problem of problems) {
      await tx.problem.upsert({
        where: { id: problem.id },
        update: {
          name: problem.name,
          difficulty: problem.difficulty,
          firstContestId: problem.firstContestId,
        },
        create: {
          id: problem.id,
          name: problem.name,
          difficulty: problem.difficulty,
          firstContestId: problem.firstContestId,
        },
      });
    }

    for (const cp of contestProblems) {
      await tx.contestProblem.upsert({
        where: {
          contestId_problemId: {
            contestId: cp.contestId,
            problemId: cp.problemId,
          },
        },
        update: {
          problemIndex: cp.problemIndex,
        },
        create: {
          contestId: cp.contestId,
          problemId: cp.problemId,
          problemIndex: cp.problemIndex,
        },
      });
    }
  })
}