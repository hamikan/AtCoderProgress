import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { getProblemDetail, getUserSolutions } from '@/lib/services/db/solution';
import { getAvailableTagsFromDB } from '@/lib/services/db/tag';
import SolutionsWorkspace from '@/components/solutions/SolutionsWorkspace';
import { normalizeNewSolutionSearchParams } from './search-params';

interface NewSolutionPageProps {
  searchParams: Promise<{
    problemId?: string;
    contestId?: string;
  }>;
}

export default async function NewSolutionPage({ searchParams }: NewSolutionPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { problemId, contestId } = normalizeNewSolutionSearchParams(await searchParams);

  const [solutions, availableTags, initialProblem] = await Promise.all([
    getUserSolutions(session.user.id),
    getAvailableTagsFromDB(session.user.id),
    problemId ? getProblemDetail(problemId) : Promise.resolve(null),
  ]);

  return (
    <SolutionsWorkspace
      solutions={solutions}
      availableTags={availableTags}
      initialProblem={initialProblem}
      initialSolution={null}
      initialContestId={contestId}
      initialRelatedSolutions={[]}
    />
  );
}
