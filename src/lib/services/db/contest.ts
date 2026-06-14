import { prisma } from '@/lib/prisma';
import {
  DEFAULT_CONTEST_PAGE_SIZE,
  MAX_CONTEST_PAGE_SIZE,
  validateContestCursor,
} from '@/lib/validation/contest-page';
import { getSubmissionSummaryByProblemIds } from './submission';
import type { Contest, ContestKind, ContestOrder } from '@/types/contest';
import type { Problem } from '@/types/problem';
import type { SubmissionStatus } from '@/types/submission';

export interface ContestStats {
  total: number;
  ac: number;
  trying: number;
  unsolved: number;
}

export interface ContestPageResult {
  contests: Array<Contest>;
  totalProblems: number;
  submissionStatusMap: Record<string, SubmissionStatus>;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ContestWorkspaceResult extends ContestPageResult {
  stats: ContestStats;
}

interface ContestPageOptions {
  cursor?: string | null;
  pageSize?: number;
  userId?: string;
}

export async function getContestsFromDB(
  contestType: ContestKind = 'abc',
  order: ContestOrder = 'desc'
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

  const contests = mapContestRows(contestsFromDB);
  return { contests, totalProblems: getContestProblemIds(contests).length };
}

export async function getContestPageFromDB(
  contestType: ContestKind = 'abc',
  order: ContestOrder = 'desc',
  { cursor = null, pageSize = DEFAULT_CONTEST_PAGE_SIZE }: ContestPageOptions = {}
): Promise<{
  contests: Array<Contest>;
  totalProblems: number;
  nextCursor: string | null;
  hasMore: boolean;
}> {
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_CONTEST_PAGE_SIZE) {
    throw new Error(`Invalid contest page size: ${pageSize}`);
  }
  if (!validateContestCursor(cursor, contestType)) {
    throw new Error(`Invalid contest cursor: ${cursor}`);
  }

  const rows = await prisma.contest.findMany({
    where: {
      id: {
        startsWith: contestType,
        ...getAfterCursorFilter({ order, cursor }),
      },
    },
    orderBy: {
      id: order,
    },
    take: pageSize + 1,
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

  const visibleRows = rows.slice(0, pageSize);
  const contests = mapContestRows(visibleRows);
  const hasMore = rows.length > pageSize;
  const nextCursor = hasMore ? contests.at(-1)?.id ?? null : null;

  return {
    contests,
    totalProblems: getContestProblemIds(contests).length,
    nextCursor,
    hasMore,
  };
}

export async function getContestPageWithSubmissions(
  contestType: ContestKind = 'abc',
  order: ContestOrder = 'desc',
  options: ContestPageOptions = {}
): Promise<ContestPageResult> {
  const contestPage = await getContestPageFromDB(contestType, order, options);
  const problemIds = getContestProblemIds(contestPage.contests);
  const submissionSummary = options.userId
    ? await getSubmissionSummaryByProblemIds(options.userId, problemIds)
    : { statusMap: {}, acCount: 0, tryingCount: 0 };

  return {
    ...contestPage,
    submissionStatusMap: submissionSummary.statusMap,
  };
}

export async function getContestWorkspaceData(
  contestType: ContestKind = 'abc',
  order: ContestOrder = 'desc',
  options: ContestPageOptions = {}
): Promise<ContestWorkspaceResult> {
  const [contestPage, stats] = await Promise.all([
    getContestPageWithSubmissions(contestType, order, options),
    getContestStatsFromDB(contestType, options.userId),
  ]);

  return {
    ...contestPage,
    stats,
  };
}

export async function getContestStatsFromDB(
  contestType: ContestKind = 'abc',
  userId?: string
): Promise<ContestStats> {
  const problemRows = await prisma.contestProblem.findMany({
    where: {
      contestId: { startsWith: contestType },
    },
    select: {
      problemId: true,
    },
    distinct: ['problemId'],
  });
  const problemIds = problemRows.map((row) => row.problemId);

  if (!userId || problemIds.length === 0) {
    return buildContestStats({
      total: problemIds.length,
      acCount: 0,
      tryingCount: 0,
    });
  }

  const [acRows, submittedRows] = await prisma.$transaction([
    prisma.submission.findMany({
      where: {
        userId,
        problemId: { in: problemIds },
        result: 'AC',
      },
      select: {
        problemId: true,
      },
      distinct: ['problemId'],
    }),
    prisma.submission.findMany({
      where: {
        userId,
        problemId: { in: problemIds },
      },
      select: {
        problemId: true,
      },
      distinct: ['problemId'],
    }),
  ]);

  return buildContestStats({
    total: problemIds.length,
    acCount: acRows.length,
    tryingCount: submittedRows.length - acRows.length,
  });
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
  const stats = {
    total,
    ac: acCount,
    trying: tryingCount,
    unsolved: total - acCount - tryingCount,
  };

  return stats;
}

export function getContestProblemIds(contests: Array<Contest>): string[] {
  return contests.flatMap((contest) =>
    Object.values(contest.problems).flatMap((problem) => (problem ? [problem.id] : []))
  );
}

function getAfterCursorFilter({
  order,
  cursor,
}: {
  order: ContestOrder;
  cursor: string | null;
}) {
  if (cursor) return order === 'desc' ? { lt: cursor } : { gt: cursor };
  return {};
}

function mapContestRows(
  contestsFromDB: Array<{
    id: string;
    startEpochSecond: number;
    durationSecond: bigint;
    problems: Array<{
      problemIndex: string;
      problem: {
        id: string;
        name: string;
        difficulty: number | null;
        totalSolutionCount: number;
      };
    }>;
  }>
): Array<Contest> {
  return contestsFromDB.map((contest) => {
    const problems: Record<string, Problem | null> = {};
    for (const problem of contest.problems) {
      problems[problem.problemIndex] = {
        id: problem.problem.id,
        name: problem.problem.name,
        difficulty: problem.problem.difficulty,
        totalSolutionCount: problem.problem.totalSolutionCount,
      };
    }

    return {
      id: contest.id,
      startEpochSecond: contest.startEpochSecond,
      durationSecond: Number(contest.durationSecond),
      problems,
    };
  });
}
