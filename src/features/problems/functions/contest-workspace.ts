import type {
  Contest,
  ContestKind,
  ContestOrder,
  ContestRow,
  ContestStats,
  Problem,
} from '@/features/problems/types';
import type { SubmissionStatus } from '@/features/submissions/types';

/**
 * Cache key for the contest list kept in the browser across page
 * transitions. The submission statuses in the list belong to one user
 * and one linked AtCoder ID, so the key must include both: otherwise
 * the colors stay stale after linking or changing the ID (issue #119).
 */
export function buildContestListCacheKey(
  userScope: string,
  contestType: ContestKind,
  order: ContestOrder
): string {
  return `${userScope}:${contestType}:${order}`;
}

/**
 * Overlays freshly delivered submission statuses onto a cached map.
 * Fresh values win; entries for contests outside the fresh chunk are
 * kept as they are.
 */
export function mergeSubmissionStatusMap(
  cached: Record<string, SubmissionStatus>,
  fresh: Record<string, SubmissionStatus>
): Record<string, SubmissionStatus> {
  return { ...cached, ...fresh };
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
