import { getCurrentUser } from '@/features/auth/api/get-current-user';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import { getSelectableTags } from '@/features/problems/api/get-selectable-tags';
import { getProblemDetail } from '@/features/problems/api/get-problem-detail';
import { searchProblems } from '@/features/problems/api/search-problems';
import { getSolutionById } from '@/features/solutions/api/get-solution-by-id';
import { getSolutionRecords } from '@/features/solutions/api/get-solution-records';
import { getUserSolutions } from '@/features/solutions/api/get-user-solutions';
import SolutionsWorkspace from '@/features/solutions/components/SolutionsWorkspace';
import { normalizeSolutionSearchParams } from '@/features/solutions/functions/normalize-solution-search-params';
import type {
  SolutionRecordListItem,
  SolutionSearchParamsInput,
  SolutionWithTags,
} from '@/features/solutions/types';
import type { ProblemDetail } from '@/features/problems/types';

interface SolutionsPageProps {
  searchParams: Promise<SolutionSearchParamsInput>;
}

export default async function SolutionsPage({ searchParams }: SolutionsPageProps) {
  const user = await getCurrentUser();
  const userId = user?.id;
  const { problemSearch } = normalizeSolutionSearchParams(await searchParams);
  const [solutions, availableTags, problemSearchResults] = await Promise.all([
    getUserSolutions(userId),
    getSelectableTags(userId),
    searchProblems(problemSearch),
  ]);

  let initialProblem: ProblemDetail | null = null;
  let initialSolution: SolutionWithTags | null = null;
  let initialContestId: string | null = null;
  let initialRelatedSolutions: SolutionRecordListItem[] = [];

  const firstSolutionId = solutions[0]?.latestSolutionId;
  if (firstSolutionId) {
    const solution = userId
      ? await getSolutionById(userId, firstSolutionId)
      : null;
    if (solution) {
      const [problem, relatedSolutions] = await Promise.all([
        getProblemDetail(solution.problemId),
        getSolutionRecords(userId, solution.problemId),
      ]);
      initialProblem = problem;
      initialSolution = solution;
      initialContestId = solution.contestId;
      initialRelatedSolutions = relatedSolutions;
    }
  }

  return (
    <SolutionsWorkspace
      solutions={solutions}
      availableTags={availableTags}
      initialProblem={initialProblem}
      initialSolution={initialSolution}
      initialContestId={initialContestId}
      initialRelatedSolutions={initialRelatedSolutions}
      problemSearchQuery={problemSearch}
      problemSearchResults={problemSearchResults}
      isAuthenticated={Boolean(user)}
      notice={!user ? <LoginPrompt returnTo="/solutions" /> : null}
    />
  );
}
