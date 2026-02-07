import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { FetchContestData } from '@/app/(main)/problems/_components/FetchContestData';
import { FetchProblemListData } from './_components/FetchProblemListData';

interface ProblemsPageProps {
  searchParams: Promise<{
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
  }>;
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? undefined;

  const params = await searchParams;
  const view = params.view ?? 'contest';

  const contestFilters = {
    contestType: params.contestType,
    order: params.order
  };

  const listFilters = {
    search: params.search,
    tags: params.tags ? params.tags.split(',') : [],
    difficulty_min: params.difficulty_min ? parseInt(params.difficulty_min, 10) : undefined,
    difficulty_max: params.difficulty_max ? parseInt(params.difficulty_max, 10) : undefined,
    status: params.status,
    contestType: params.contestType,
    sort: params.sort,
    order: params.order,
    view: params.view,
    page: params.page ? parseInt(params.page, 10) : 1,
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 h-full">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Suspense fallback={<div className="text-center p-8">Loading problems...</div>}>
          {view === 'contest' && (
            <FetchContestData
              filters={contestFilters}
              userId={userId}
            />
          )}
          {view === 'list' && (
            <FetchProblemListData
              filters={listFilters}
              userId={userId}
            />
          )}
        </Suspense>
      </div>
    </div>
  )
}
