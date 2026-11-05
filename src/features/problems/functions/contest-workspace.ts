import type {
  Contest,
  ContestKind,
  ContestOrder,
  ContestRow,
  ContestStats,
  Problem,
} from '@/features/problems/types';

// 提出を取り直すと日時が変わるので、ブラウザ側のキャッシュも作り直される
export function buildContestCacheScope(
  user: { id: string; atcoderId: string | null } | null,
  submissionsLastFetchedAt: Date | null
): string {
  if (!user) return 'anonymous';
  return [user.id, user.atcoderId ?? '', submissionsLastFetchedAt?.getTime() ?? ''].join(':');
}

export function buildContestListCacheKey(
  cacheScope: string,
  contestType: ContestKind,
  order: ContestOrder
): string {
  return `${cacheScope}:${contestType}:${order}`;
}

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
