import { notFound } from 'next/navigation';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import { getSelectableTags } from '@/features/problems/api/get-selectable-tags';
import { getProblemDetail } from '@/features/problems/api/get-problem-detail';
import { searchProblems } from '@/features/problems/api/search-problems';
import { getSolutionById } from '@/features/solutions/api/get-solution-by-id';
import { getSolutionRecords } from '@/features/solutions/api/get-solution-records';
import { getUserSolutions } from '@/features/solutions/api/get-user-solutions';
import SolutionsWorkspace from '@/features/solutions/components/SolutionsWorkspace';
import { parseSolutionRouteParams } from '@/features/solutions/functions/parse-solution-route-params';
import { normalizeSolutionSearchParams } from '@/features/solutions/functions/normalize-solution-search-params';
import type {
  SolutionRouteParamsInput,
  SolutionSearchParamsInput,
} from '@/features/solutions/types';

interface SolutionPageProps {
  params: Promise<SolutionRouteParamsInput>;
  searchParams: Promise<SolutionSearchParamsInput>;
}

export default async function SolutionPage({ params, searchParams }: SolutionPageProps) {
  const user = await getCurrentUser();
  const userId = user?.id;

  let solutionId: string;
  try {
    ({ solutionId } = parseSolutionRouteParams(await params));
  } catch {
    notFound();
  }

  const { problemId, problemSearch } = normalizeSolutionSearchParams(await searchParams);
  const [solution, solutions, availableTags, problemSearchResults] = await Promise.all([
    userId ? getSolutionById(userId, solutionId) : Promise.resolve(null),
    getUserSolutions(userId),
    getSelectableTags(userId),
    searchProblems(problemSearch),
  ]);

  if (userId && !solution) {
    notFound();
  }

  const selectedProblemId = problemId ?? solution?.problemId ?? null;
  const [problem, relatedSolutions] = await Promise.all([
    selectedProblemId ? getProblemDetail(selectedProblemId) : Promise.resolve(null),
    selectedProblemId
      ? getSolutionRecords(userId, selectedProblemId)
      : Promise.resolve([]),
  ]);
  if (userId && solution && !problem) {
    notFound();
  }

  return (
    <SolutionsWorkspace
      solutions={solutions}
      availableTags={availableTags}
      initialProblem={problem}
      initialSolution={solution}
      initialContestId={solution?.contestId ?? null}
      initialRelatedSolutions={relatedSolutions}
      problemSearchQuery={problemSearch}
      problemSearchResults={problemSearchResults}
      isAuthenticated={Boolean(user)}
      notice={
        !user ? (
          <LoginPrompt
            returnTo={`/solutions/${solutionId}`}
            description="この解法記録を表示・保存するにはログインが必要です。編集画面は先に確認できます。"
          />
        ) : null
      }
    />
  );
}
