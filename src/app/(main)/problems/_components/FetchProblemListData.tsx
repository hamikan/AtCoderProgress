import ProblemsFilters from '@/components/problem/ProblemsFilters';
import ProblemsList from '@/components/problem/ProblemsList';
import { getProblemListFromDB, ProblemListFilters } from '@/lib/services/db/problem';
import { getAvailableTagsFromDB } from '@/lib/services/db/tag';

interface FetchProblemListDataProps {
  filters: ProblemListFilters;
  userId?: string;
}

export async function FetchProblemListData({ filters, userId }: FetchProblemListDataProps) {
  const [problemResult, availableTags] = await Promise.all([
    getProblemListFromDB({
      ...filters,
      userId
    }),
    getAvailableTagsFromDB(userId),
  ]);
  const { problems: items, totalProblems: totalCount } = problemResult;

  return (
    <div className="space-y-6">
      <ProblemsFilters filters={filters} availableTags={availableTags} />
      <ProblemsList items={items} totalCount={totalCount} />
    </div>
  );
}
