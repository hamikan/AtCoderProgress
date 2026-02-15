import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { redirect, notFound } from 'next/navigation';
import { getSolutionByProblemId, getProblemDetail } from '@/lib/services/db/solution';
import { getAvailableTagsFromDB } from '@/lib/services/db/tag';
import SolutionEditor from '@/components/solutions/SolutionEditor';

interface SolutionPageProps {
  params: Promise<{
    problemId: string;
  }>;
}

export default async function SolutionPage({ params }: SolutionPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { problemId } = await params;
  const problem = await getProblemDetail(problemId);
  if (!problem) {
    notFound();
  }

  const solution = await getSolutionByProblemId(session.user.id, problemId);
  const availableTags = await getAvailableTagsFromDB(session.user.id);

  return (
    <div className="min-h-screen bg-[#f9fafb] py-8">
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
        <SolutionEditor
          problem={problem}
          initialSolution={solution}
          availableTags={availableTags}
        />
      </div>
    </div>
  );
}
