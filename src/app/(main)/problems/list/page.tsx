import { Suspense } from 'react';
import { getCurrentUser } from '@/features/auth/api/get-current-user';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import { getProblemList } from '@/features/problems/api/get-problem-list';
import { normalizeProblemListSearchParams } from '@/features/problems/functions/normalize-problem-list-search-params';
import { getSelectableTags } from '@/features/problems/api/get-selectable-tags';
import ProblemsFilters from '@/features/problems/components/ProblemsFilters';
import ProblemsList from '@/features/problems/components/ProblemsList';
import type { ProblemListSearchParamsInput } from '@/features/problems/types';

interface ProblemListPageProps {
  searchParams: Promise<ProblemListSearchParamsInput>;
}

export default async function ProblemListPage({ searchParams }: ProblemListPageProps) {
  const user = await getCurrentUser();
  const userId = user?.id;
  const params = await searchParams;
  const filters = normalizeProblemListSearchParams(params, userId);

  const [{ problems, totalProblems }, availableTags] = await Promise.all([
    getProblemList(filters),
    getSelectableTags(userId),
  ]);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 h-full">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-6">
          {!user && (
            <LoginPrompt
              returnTo="/problems/list"
              description="ログインすると、問題ごとの挑戦状況や解法ステータスを表示できます。"
            />
          )}
          <ProblemsFilters
            filters={filters}
            availableTags={availableTags}
            isAuthenticated={Boolean(user)}
          />
          <Suspense fallback={<div className="text-center p-8">Loading problems...</div>}>
            <ProblemsList items={problems} totalCount={totalProblems} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
