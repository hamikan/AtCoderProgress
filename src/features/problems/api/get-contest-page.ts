import 'server-only';

import {
  DEFAULT_CONTEST_PAGE_SIZE,
  MAX_CONTEST_PAGE_SIZE,
  isValidContestCursor,
} from '@/features/problems/functions/contest-page-params';
import {
  buildContests,
  getContestCursorFilter,
  getContestProblemIds,
} from '@/features/problems/functions/contest-workspace';
import type {
  ContestKind,
  ContestOrder,
  ContestPageData,
  ContestPageOptions,
} from '@/features/problems/types';
import { prisma } from '@/lib/prisma';

export async function getContestPage(
  contestType: ContestKind = 'abc',
  order: ContestOrder = 'desc',
  { cursor = null, pageSize = DEFAULT_CONTEST_PAGE_SIZE }: ContestPageOptions = {}
): Promise<ContestPageData> {
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_CONTEST_PAGE_SIZE) {
    throw new Error(`Invalid contest page size: ${pageSize}`);
  }
  if (!isValidContestCursor(cursor, contestType)) {
    throw new Error(`Invalid contest cursor: ${cursor}`);
  }

  const rows = await prisma.contest.findMany({
    where: {
      id: {
        startsWith: contestType,
        ...getContestCursorFilter(order, cursor),
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
  const contests = buildContests(visibleRows);
  const hasMore = rows.length > pageSize;
  const nextCursor = hasMore ? contests.at(-1)?.id ?? null : null;

  return {
    contests,
    totalProblems: getContestProblemIds(contests).length,
    nextCursor,
    hasMore,
  };
}
