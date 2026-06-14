import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { redirect, notFound } from 'next/navigation';
import {
  getSolutionById,
  getProblemDetail,
  getSolutionsByProblemAndContest,
  getUserSolutions,
} from '@/lib/services/db/solution';
import { getAvailableTagsFromDB } from '@/lib/services/db/tag';
import SolutionsWorkspace from '@/components/solutions/SolutionsWorkspace';
import { normalizeSolutionRouteParams } from './params';

interface SolutionPageProps {
  params: Promise<{
    solutionId: string;
  }>;
}

export default async function SolutionPage({ params }: SolutionPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  let solutionId: string;

  try {
    ({ solutionId } = normalizeSolutionRouteParams(await params));
  } catch {
    notFound();
  }

  const [solution, solutions, availableTags] = await Promise.all([
    getSolutionById(session.user.id, solutionId),
    getUserSolutions(session.user.id),
    getAvailableTagsFromDB(session.user.id),
  ]);

  if (!solution) {
    notFound();
  }

  const [problem, relatedSolutions] = await Promise.all([
    getProblemDetail(solution.problemId),
    getSolutionsByProblemAndContest(session.user.id, solution.problemId, solution.contestId),
  ]);
  if (!problem) {
    notFound();
  }

  return (
    <SolutionsWorkspace
      solutions={solutions}
      availableTags={availableTags}
      initialProblem={problem}
      initialSolution={solution}
      initialContestId={solution.contestId}
      initialRelatedSolutions={relatedSolutions}
    />
  );
}
