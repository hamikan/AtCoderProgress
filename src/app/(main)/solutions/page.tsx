import { getCurrentUser } from '@/features/auth/api/get-current-user';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import { getSelectableTags } from '@/features/problems/api/get-selectable-tags';
import { getProblemDetail } from '@/features/problems/api/get-problem-detail';
import { getSolutionById } from '@/features/solutions/api/get-solution-by-id';
import { getSolutionRecords } from '@/features/solutions/api/get-solution-records';
import { getSidebarContestProblems } from '@/features/solutions/api/get-sidebar-contest-problems';
import { getUserSolutions } from '@/features/solutions/api/get-user-solutions';
import SolutionsWorkspace from '@/features/solutions/components/SolutionsWorkspace';
import type {
  SolutionRecordListItem,
  SolutionWithTags,
} from '@/features/solutions/types';
import type { ProblemDetail } from '@/features/problems/types';

export default async function SolutionsPage() {
  const user = await getCurrentUser();
  const userId = user?.id;
  const [solutions, contestProblems, availableTags] =
    await Promise.all([
      getUserSolutions(userId),
      getSidebarContestProblems(userId),
      getSelectableTags(userId),
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
      contestProblems={contestProblems}
      availableTags={availableTags}
      initialProblem={initialProblem}
      initialSolution={initialSolution}
      initialContestId={initialContestId}
      initialRelatedSolutions={initialRelatedSolutions}
      isAuthenticated={Boolean(user)}
      notice={!user ? <LoginPrompt returnTo="/solutions" /> : null}
    />
  );
}
