import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { ProblemListItem } from '@/types/problem';

export interface ProblemListFilters {
  search?: string;
  tags?: Array<string>;
  difficulty_min?: number;
  difficulty_max?: number;
  status?: string;
  contestType?: 'abc' | 'arc' | 'agc';
  order?: 'asc' | 'desc';
  orderBy?: 'difficulty' | 'problemName';
  page?: number;
  pageSize?: number;
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

  if (contestType) {
    where.contests = {
      some: {
        contestId: { startsWith: contestType }
      }
    };
  }

  // TODO: Implement tag filtering when SolutionUserTag logic is established
  // TODO: Implement status filtering when Solution status logic is established

  let prismaOrderBy: Prisma.ProblemOrderByWithRelationInput | undefined = undefined;
  if (order && orderBy) {
    switch (orderBy) {
      case 'difficulty':
        prismaOrderBy = { difficulty: order };
        break;
      case 'problemName':
        prismaOrderBy = { name: order };
        break;
    }
  }

    const [totalProblems, raws] = await prisma.$transaction([
      prisma.problem.count({ where }),
      prisma.problem.findMany({
        where,
        include: {
          contests: {
            take: 1
          }
        },
        orderBy: prismaOrderBy,
        skip,
        take: pageSize,
      })
    ]);
  
    const problems: Array<ProblemListItem> = raws.map((row) => {
      const mainContest = row.contests[0];
      return {
        id: row.id,
        name: row.name,
        contestId: row.firstContestId ?? mainContest?.contestId ?? 'unknown',
        problemIndex: mainContest?.problemIndex ?? '-',
        difficulty: row.difficulty ?? null,
        totalSolutionCount: row.totalSolutionCount,
      };
    });
    return { problems, totalProblems };
}
