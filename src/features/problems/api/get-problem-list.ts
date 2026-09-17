import 'server-only';

import { Prisma } from '@prisma/client';

import { buildProblemListItems } from '@/features/problems/functions/build-problem-list-items';
import { normalizeProblemListFilters } from '@/features/problems/functions/normalize-problem-list-filters';
import type {
  ProblemListFiltersInput,
  ProblemListItem,
} from '@/features/problems/types';
import { prisma } from '@/lib/prisma';

const TAG_THRESHOLD = 1;

export async function getProblemList(
  input: ProblemListFiltersInput
): Promise<{ problems: ProblemListItem[]; totalProblems: number }> {
  const {
    search,
    tags,
    difficultyMin,
    difficultyMax,
    status,
    contestType,
    order = 'asc',
    orderBy,
    page = 1,
    pageSize = 50,
    userId,
  } = normalizeProblemListFilters(input);
  const skip = (page - 1) * pageSize;

  const where: Prisma.ProblemWhereInput = {};

  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (difficultyMin !== undefined || difficultyMax !== undefined) {
    where.difficulty = {
      ...(difficultyMin !== undefined ? { gte: difficultyMin } : {}),
      ...(difficultyMax !== undefined ? { lte: difficultyMax } : {}),
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
        where.solutions = { some: { userId, status } };
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

  const problems: ProblemListItem[] = buildProblemListItems(raws, userId);

  return { problems, totalProblems };
}
