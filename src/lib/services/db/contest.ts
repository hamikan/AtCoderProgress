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
    include: {
      problems: {
        include: { problem: true },
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
        ...problem.problem,
        totalSolutionCount: 0, // 必要に応じて集計ロジックを実装
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
