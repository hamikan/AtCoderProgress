import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { getUserSolutions, getSolutionByProblemId, getProblemDetail } from '@/lib/services/db/solution';
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
  let initialProblem = null;
  let initialSolution = null;

  if (solutions.length > 0) {
    const firstProblemId = solutions[0].problemId;
    const [problem, solution] = await Promise.all([
      getProblemDetail(firstProblemId),
      getSolutionByProblemId(userId, firstProblemId),
    ]);
    initialProblem = problem;
    initialSolution = solution;
  }

  return (
    <SolutionsWorkspace
      solutions={solutions}
      availableTags={availableTags}
      initialProblem={initialProblem}
      initialSolution={initialSolution}
    />
  );
}