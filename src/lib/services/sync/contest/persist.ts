import { prisma } from '@/lib/prisma';
import type { NormalizedContestData } from './types';

export async function persistContestData(data: NormalizedContestData) {
  const { contests, problems, contestProblems } = data;

  console.log(`Upserting ${contests.length} contests...`);
  for (const contest of contests) {
    await prisma.contest.upsert({
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

  console.log(`Upserting ${problems.length} problems...`);
  // Process problems in chunks to avoid "heap out of memory" or connection issues if parallel, 
  // but strictly sequential is fine, just slow.
  // Let's keep it sequential for safety as requested.
  for (const problem of problems) {
    await prisma.problem.upsert({
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

  console.log(`Upserting ${contestProblems.length} contest-problem relations...`);
  for (const cp of contestProblems) {
    await prisma.contestProblem.upsert({
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
}