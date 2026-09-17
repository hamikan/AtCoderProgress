import type {
  Contest,
  ContestOrder,
  ContestRow,
  ContestStats,
  Problem,
} from '@/features/problems/types';

export function buildContestStats({
  total,
  acCount,
  tryingCount,
}: {
  total: number;
  acCount: number;
  tryingCount: number;
}): ContestStats {
  return {
    total,
    ac: acCount,
    trying: tryingCount,
    unsolved: total - acCount - tryingCount,
  };
}

export function getContestProblemIds(contests: Contest[]): string[] {
  return contests.flatMap((contest) =>
    Object.values(contest.problems).flatMap((problem) =>
      problem ? [problem.id] : []
    )
  );
}

export function getContestCursorFilter(
  order: ContestOrder,
  cursor: string | null
): { gt?: string; lt?: string } {
  if (!cursor) return {};
  return order === 'desc' ? { lt: cursor } : { gt: cursor };
}

export function buildContests(rows: ContestRow[]): Contest[] {
  return rows.map((contest) => {
    const problems = contest.problems.reduce<Record<string, Problem>>(
      (result, contestProblem) => ({
        ...result,
        [contestProblem.problemIndex]: {
          id: contestProblem.problem.id,
          name: contestProblem.problem.name,
          difficulty: contestProblem.problem.difficulty,
          totalSolutionCount: contestProblem.problem.totalSolutionCount,
        },
      }),
      {}
    );

    return {
      id: contest.id,
      startEpochSecond: contest.startEpochSecond,
      durationSecond: Number(contest.durationSecond),
      problems,
    };
  });
}
