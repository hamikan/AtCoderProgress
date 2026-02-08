import { prisma } from '@/lib/prisma';
import { Prisma, SolutionStatus } from '@prisma/client';
import type { ProblemListItem } from '@/types/problem';
import type { ContestType } from '@/types/contest';

const TAG_THRESHOLD = 1;

const STATUS_PRIORITY: Record<SolutionStatus, number> = {
  REVIEW_AC: 6,
  SELF_AC: 5,
  EXPLANATION_AC: 4,
  AC: 3,
  TRYING: 2,
  UNSOLVED: 1,
};

export interface ProblemListFilters {
  search?: string;
  tags?: Array<string>;
  difficulty_min?: number;
  difficulty_max?: number;
  status?: string;
  contestType?: ContestType;
  order?: 'asc' | 'desc';
  orderBy?: 'difficulty' | 'contestDate';
  page: number;
  pageSize?: number;
  userId?: string;
}

export async function getProblemListFromDB({
  search,
  tags,
  difficulty_min,
  difficulty_max,
  status,
  contestType,
  order = 'asc',
  orderBy,
  page = 1,
  pageSize = 50,
  userId,
}: ProblemListFilters): Promise<{ problems: Array<ProblemListItem>; totalProblems: number; }> {
  const skip = (page - 1) * pageSize;

  const where: Prisma.ProblemWhereInput = {};

  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (difficulty_min !== undefined || difficulty_max !== undefined) {
    where.difficulty = {
      ...(difficulty_min !== undefined ? { gte: difficulty_min } : {}),
      ...(difficulty_max !== undefined ? { lte: difficulty_max } : {}),
    };
  }

  if (contestType && contestType !== 'ALL') {
    where.contests = {
      some: {
        contestId: { startsWith: contestType.toLowerCase() }
      }
    };
  }

  if (tags && tags.length > 0) {
    where.problemTags = {
      some: {
        tagId: { in: tags },
        count: { gte: TAG_THRESHOLD }
      }
    };
  }

  if (status && status !== 'ALL' && userId) {
    switch (status) {
      case 'AC':
        where.OR = [
          { solutions: { some: { userId, status: { in: ['AC', 'SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC'] } } } },
          { submissions: { some: { userId, result: 'AC' } } }
        ];
        break;
      case 'TRYING':
        where.AND = [
          {
            OR: [
              { solutions: { some: { userId, status: 'TRYING' } } },
              { submissions: { some: { userId } } }
            ]
          },
          { NOT: { submissions: { some: { userId, result: 'AC' } } } },
          { NOT: { solutions: { some: { userId, status: { in: ['AC', 'SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC'] } } } } }
        ];
        break;
      case 'UNSOLVED':
        where.AND = [
          { NOT: { submissions: { some: { userId } } } },
          { NOT: { solutions: { some: { userId } } } }
        ];
        break;
      default:
        where.solutions = { some: { userId, status: status as SolutionStatus } };
    }
  }

  let prismaOrderBy: Prisma.ProblemFindManyArgs['orderBy'] = undefined;
  if (order && orderBy) {
    switch (orderBy) {
      case 'difficulty':
        prismaOrderBy = { difficulty: order };
        break;
      case 'contestDate':
        prismaOrderBy = [
          {
            firstContest: {
              startEpochSecond: order
            }
          }
        ];
        break;
    }
  }

  const [totalProblems, raws] = await prisma.$transaction([
    prisma.problem.count({ where }),
    prisma.problem.findMany({
      where,
      include: {
        contests: true,
        solutions: {
          where: { userId: userId ?? '' },
          select: { status: true }
        },
        submissions: {
          where: { userId: userId ?? '', result: 'AC' },
          take: 1,
          select: { id: true }
        },
        _count: {
          select: {
            submissions: {
              where: { userId: userId ?? '' }
            }
          }
        }
      },
      orderBy: prismaOrderBy,
      skip,
      take: pageSize,
    })
  ]);

  const problems: Array<ProblemListItem> = raws.map((row) => {
    const mainContest = row.contests.find(c => c.contestId === row.firstContestId);
    
    let finalStatus: SolutionStatus = 'UNSOLVED';
    if (userId) {
      if (row.solutions.length > 0) {
        const bestSolution = row.solutions.reduce((prev, curr) => 
          STATUS_PRIORITY[curr.status] > STATUS_PRIORITY[prev.status] ? curr : prev
        );
        finalStatus = bestSolution.status;
      } else if (row.submissions.length > 0) {
        finalStatus = 'AC';
      } else if (row._count.submissions > 0) {
        finalStatus = 'TRYING';
      }
    }

    return {
      id: row.id,
      name: row.name,
      contestId: row.firstContestId,
      problemIndex: mainContest?.problemIndex ?? 'unknown',
      difficulty: row.difficulty ?? null,
      totalSolutionCount: row.totalSolutionCount,
      status: finalStatus,
    };
  });

  return { problems, totalProblems };
}
