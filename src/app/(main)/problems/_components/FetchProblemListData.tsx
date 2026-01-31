import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ProblemsFilters from '@/components/problem/ProblemsFilters';
import ProblemsList, { ProblemListItem } from '@/components/problem/ProblemsList';

interface ProblemListFilters {
  search?: string;
  tags?: string;
  difficulty_min?: string;
  difficulty_max?: string;
  status?: string;
  contestType?: 'abc' | 'arc' | 'agc';
  sort?: string;
  order?: 'asc' | 'desc';
  view?: 'contest' | 'list';
  page?: string;
}

interface FetchProblemListDataProps {
  filters: ProblemListFilters;
}

const PAGE_SIZE: number = 50;

export async function FetchProblemListData({ filters }: FetchProblemListDataProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const page = Math.max(1, parseInt(filters.page ?? '1', 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.ContestProblemWhereInput = {};
  if (filters.contestType) {
    where.contestId = { startsWith: filters.contestType };
  }

  const problemWhere: Prisma.ProblemWhereInput = {};

  if (filters.search) {
    where.OR = [
      { contestId: { contains: filters.search, mode: 'insensitive' } },
      { problemId: { contains: filters.search, mode: 'insensitive' } },
      { problem: { name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const min = parseInt(filters.difficulty_min ?? '', 10);
  const max = parseInt(filters.difficulty_max ?? '', 10);
  if (!Number.isNaN(min) || !Number.isNaN(max)) {
    problemWhere.difficulty = {
      ...(Number.isNaN(min) ? {} : { gte: min }),
      ...(Number.isNaN(max) ? {} : { lte: max }),
    };
  }

  if (Object.keys(problemWhere).length > 0) {
    where.problem = problemWhere;
  }

  const order: Prisma.SortOrder = filters.order === 'asc' ? 'asc' : 'desc';
  const orderBy: Prisma.ContestProblemOrderByWithRelationInput =
    filters.sort === 'difficulty'
      ? { problem: { difficulty: order } }
      : filters.sort === 'name'
      ? { problem: { name: order } }
      : filters.sort === 'contest_id'
      ? { contestId: order }
      : filters.sort === 'solutions'
      ? { problem: { totalSolutionCount: order } }
      : { contestId: 'desc' };

  const [totalCount, rows] = await prisma.$transaction([
    prisma.contestProblem.count({ where }),
    prisma.contestProblem.findMany({
      where,
      include: { problem: true },
      orderBy,
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  const items: ProblemListItem[] = rows.map((row) => ({
    id: row.problemId,
    name: row.problem?.name ?? '',
    contestId: row.contestId,
    problemIndex: row.problemIndex,
    difficulty: row.problem?.difficulty ?? null,
    totalSolutionCount: row.problem?.totalSolutionCount ?? undefined,
  }));

  const availableTags = await prisma.tag.findMany({
    where: {
      OR: [
        { isOfficial: true },
        { createdById: userId },
      ],
    },
    orderBy: { name: 'asc' },
  });

  const filterParams: { [key: string]: string | undefined } = {
    search: filters.search,
    tags: filters.tags,
    difficulty_min: filters.difficulty_min,
    difficulty_max: filters.difficulty_max,
    status: filters.status,
    contestType: filters.contestType,
    sort: filters.sort,
    order: filters.order,
    view: filters.view,
    page: filters.page,
  };

  return (
    <div className="space-y-6">
      <ProblemsFilters searchParams={filterParams} availableTags={availableTags} />
      <ProblemsList items={items} totalCount={totalCount} />
    </div>
  );
}
