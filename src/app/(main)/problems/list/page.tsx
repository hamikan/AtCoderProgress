import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { getProblemListFromDB, ProblemListFilters } from '@/lib/services/db/problem';
import { getAvailableTagsFromDB } from '@/lib/services/db/tag';
import { ContestType } from '@/types/contest';
import { SolutionStatus } from '@prisma/client'
import ProblemsFilters from '@/components/problem/ProblemsFilters';
import ProblemsList from '@/components/problem/ProblemsList';

interface ProblemListPageProps {
  searchParams: Promise<{
    search?: string;
    tags?: string;
    difficulty_min?: string;
    difficulty_max?: string;
    status?: string;
    contestType?: string;
    orderBy?: string;
    order?: string;
    page?: string;
  }>;
}

export default async function ProblemListPage({ searchParams }: ProblemListPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? undefined;
  const params = await searchParams;
  
  const finalTags = params.tags ? params.tags.split(',').filter(Boolean) : [];

  const min = parseInt(params.difficulty_min ?? '');
  const finalDifficultyMin = isNaN(min) ? undefined : min;

  const max = parseInt(params.difficulty_max ?? '');
  const finalDifficultyMax = isNaN(max) ? undefined : max;

  const VALID_CONTEST_TYPES: string[] = ['ALL', 'ABC', 'ARC', 'AGC'];
  const contestType = params.contestType?.toUpperCase() ?? '';
  const finalContestType = VALID_CONTEST_TYPES.includes(contestType)
    ? contestType
    : 'ALL'
  
  const VALID_STATUSES: string[] = ['AC', 'TRYING', 'UNSOLVED', 'SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC'];
  const status = params.status?.toUpperCase() ?? '';
  const finalStatus = VALID_STATUSES.includes(status)
    ? status
    : 'ALL';

  const VALID_ORDERBY: string[] = ['difficulty', 'contestDate'];
  const orderBy = params.orderBy ?? '';
  const finalOrderBy = VALID_ORDERBY.includes(orderBy)
    ? orderBy
    : 'contestDate';

  const VALID_ORDER: string[] = ['asc', 'desc'];
  const order = params.order?.toLowerCase() ?? '';
  const finalOrder = VALID_ORDER.includes(order)
    ? order
    : 'desc';

  const page = parseInt(params.page ?? '');
  const finalPage = isNaN(page) ? 1 : page;

  const filters: ProblemListFilters = {
    search: params.search,
    tags: finalTags,
    difficulty_min: finalDifficultyMin,
    difficulty_max: finalDifficultyMax,
    status: finalStatus as SolutionStatus | 'ALL',
    contestType: finalContestType as ContestType,
    orderBy: finalOrderBy as 'difficulty' | 'contestDate' | undefined,
    order: finalOrder as 'asc' | 'desc' | undefined,
    page: finalPage,
    userId,
  };

  const { problems, totalProblems } = await getProblemListFromDB(filters);
  const availableTags = await getAvailableTagsFromDB(userId);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 h-full">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-6">
          <ProblemsFilters filters={filters} availableTags={availableTags} />
          <Suspense fallback={<div className="text-center p-8">Loading problems...</div>}>
            <ProblemsList items={problems} totalCount={totalProblems} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
