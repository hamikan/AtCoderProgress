import { Suspense } from 'react';
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
  const params = await searchParams;
  const view = params.view ?? 'contest';

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 h-full">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Suspense fallback={<div className="text-center p-8">Loading problems...</div>}>
          {view === 'contest' && (
            <FetchContestData
              filters={{ contestType: params.contestType, order: params.order }}
            />
          )}
          {view === 'list' && (
            <FetchProblemListData filters={params} />
          )}
        </Suspense>
      </div>
    </div>
  )
}
