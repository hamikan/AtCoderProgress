import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { getProblemListFromDB } from '@/lib/services/db/problem';
import { normalizeProblemListSearchParams } from './search-params';
import { getAvailableTagsFromDB } from '@/lib/services/db/tag';
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
  const filters = normalizeProblemListSearchParams(params, userId);

  const [{ problems, totalProblems }, availableTags] = await Promise.all([
    getProblemListFromDB(filters),
    getAvailableTagsFromDB(userId),
  ]);

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
