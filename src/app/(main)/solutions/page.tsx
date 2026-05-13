import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import {
  getUserSolutions,
  getSolutionById,
  getProblemDetail,
  getSolutionsByProblemAndContest,
  type ProblemDetail,
  type SolutionRecordListItem,
  type SolutionWithTags,
} from '@/lib/services/db/solution';
import { getAvailableTagsFromDB } from '@/lib/services/db/tag';
import SolutionsWorkspace from '@/components/solutions/SolutionsWorkspace';

export default async function SolutionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  const [solutions, availableTags] = await Promise.all([
    getUserSolutions(userId),
    getAvailableTagsFromDB(userId),
  ]);

  // 最新の解法をデフォルトで表示
  let initialProblem: ProblemDetail | null = null;
  let initialSolution: SolutionWithTags | null = null;
  let initialContestId: string | null = null;
  let initialRelatedSolutions: SolutionRecordListItem[] = [];

  if (solutions.length > 0) {
    const firstSolutionId = solutions[0].latestSolutionId;
    const solution = await getSolutionById(userId, firstSolutionId);
    const firstProblemId = solution?.problemId;

    if (firstProblemId && solution) {
      const [problem, relatedSolutions] = await Promise.all([
        getProblemDetail(firstProblemId),
        getSolutionsByProblemAndContest(userId, firstProblemId, solution.contestId),
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
    />
  );
}
