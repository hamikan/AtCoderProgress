import ProblemsFilters from '@/components/problem/ProblemsFilters';
import ProblemsList from '@/components/problem/ProblemsList';
import { getProblemListFromDB, ProblemListFilters } from '@/lib/services/db/problem';
import { getAvailableTagsFromDB } from '@/lib/services/db/tag';

interface FetchProblemListDataProps {
  filters: ProblemListFilters;
  userId?: string;
}

export async function FetchProblemListData({ filters, userId }: FetchProblemListDataProps) {
  const { problems: items, totalProblems: totalCount } = await getProblemListFromDB({
    ...filters,
    userId
  });
  const availableTags = await getAvailableTagsFromDB(userId);

  return (
    <div className="space-y-6">
      <ProblemsFilters filters={filters} availableTags={availableTags} />
      <ProblemsList items={items} totalCount={totalCount} />
    </div>
  );
}
