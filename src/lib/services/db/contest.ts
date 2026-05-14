import { prisma } from '@/lib/prisma';
import type { Contest } from '@/types/contest';
import type { Problem } from '@/types/problem';

export async function getContestsFromDB(
  contestType: 'abc' | 'arc' | 'agc' = 'abc',
  order: 'asc' | 'desc' = 'desc'
): Promise<{ contests: Array<Contest>; totalProblems: number }> {
  const contestsFromDB = await prisma.contest.findMany({
    where: {
      id: { startsWith: contestType },
    },
    select: {
      id: true,
      startEpochSecond: true,
      durationSecond: true,
      problems: {
        select: {
          problemIndex: true,
          problem: {
            select: {
              id: true,
              name: true,
              difficulty: true,
              totalSolutionCount: true,
            },
          },
        },
      },
    },
  });

  contestsFromDB.sort((a, b) => {
    const comparison = a.id.localeCompare(b.id);
    return order === 'asc' ? comparison : -comparison;
  });
  
  let totalProblems: number = 0;
  const contests: Array<Contest> = contestsFromDB.map((contest) => {
    const problems: Record<string, Problem | null> = {};
    for (const problem of contest.problems) {
      problems[problem.problemIndex] = {
        id: problem.problem.id,
        name: problem.problem.name,
        difficulty: problem.problem.difficulty,
        totalSolutionCount: problem.problem.totalSolutionCount,
      };
    }

    totalProblems += contest.problems.length;

    return {
      id: contest.id,
      startEpochSecond: contest.startEpochSecond,
      durationSecond: contest.durationSecond,
      problems: problems,
    };
  });

  return { contests, totalProblems };
}
