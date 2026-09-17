import { getCurrentUser } from '@/features/auth/api/get-current-user';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import { getSelectableTags } from '@/features/problems/api/get-selectable-tags';
import { getProblemDetail } from '@/features/problems/api/get-problem-detail';
import { searchProblems } from '@/features/problems/api/search-problems';
import { getSolutionRecords } from '@/features/solutions/api/get-solution-records';
import { getUserSolutions } from '@/features/solutions/api/get-user-solutions';
import SolutionsWorkspace from '@/features/solutions/components/SolutionsWorkspace';
import { normalizeSolutionSearchParams } from '@/features/solutions/functions/normalize-solution-search-params';
import type { SolutionSearchParamsInput } from '@/features/solutions/types';

interface NewSolutionPageProps {
  searchParams: Promise<SolutionSearchParamsInput>;
}

export default async function NewSolutionPage({ searchParams }: NewSolutionPageProps) {
  const user = await getCurrentUser();
  const userId = user?.id;
  const { problemId, contestId, problemSearch } = normalizeSolutionSearchParams(
    await searchParams
  );

  const [solutions, availableTags, initialProblem, problemSearchResults] =
    await Promise.all([
      getUserSolutions(userId),
      getSelectableTags(userId),
      problemId ? getProblemDetail(problemId) : Promise.resolve(null),
      searchProblems(problemSearch),
    ]);
  const initialRelatedSolutions = initialProblem
    ? await getSolutionRecords(userId, initialProblem.id)
    : [];

  return (
    <SolutionsWorkspace
      solutions={solutions}
      availableTags={availableTags}
      initialProblem={initialProblem}
      initialSolution={null}
      initialContestId={contestId}
      initialRelatedSolutions={initialRelatedSolutions}
      problemSearchQuery={problemSearch}
      problemSearchResults={problemSearchResults}
      isAuthenticated={Boolean(user)}
      notice={!user ? <LoginPrompt returnTo="/solutions/new" /> : null}
    />
  );
}
