import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { getContestsFromDB } from '@/lib/services/db/contest';
import { getSubmissionSummary } from '@/lib/services/db/submission';
import ContestTable from '@/components/problem/ContestTable';
import ProblemStats from '@/components/problem/ProblemStats';

const getProblemIndexes = (contestType: 'abc' | 'arc' | 'agc') => {
  switch (contestType) {
    case 'abc': return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H/Ex'];
    case 'arc': return ['A', 'B', 'C', 'D', 'E', 'F', 'F2'];
    case 'agc': return ['A', 'B', 'C', 'D', 'E', 'F', 'F2'];
    default: return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H/Ex'];
  }
};

interface ContestPageProps {
  searchParams: Promise<{
    contestType?: string;
    order?: string;
  }>;
}

export default async function ContestPage({ searchParams }: ContestPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? undefined;
  const params = await searchParams;

  const contestType = (params.contestType?.toLowerCase() as 'abc' | 'arc' | 'agc') || 'abc';
  const order = (params.order as 'asc' | 'desc') || 'desc';

  const [contestResult, submissionSummary] = await Promise.all([
    getContestsFromDB(contestType, order),
    userId ? getSubmissionSummary(userId, contestType) : Promise.resolve(null),
  ]);
  const { contests, totalProblems } = contestResult;
  const problemIndexes = getProblemIndexes(contestType);

  const submissionStatusMap = submissionSummary?.statusMap ?? {};
  const acCount = submissionSummary?.acCount ?? 0;
  const tryingCount = submissionSummary?.tryingCount ?? 0;

  const stats = {
    total: totalProblems,
    ac: acCount,
    trying: tryingCount,
    unsolved: totalProblems - acCount - tryingCount,
  };

  return (
    <div className="bg-slate-50 h-full overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="flex-1">
            <ContestTable
              contests={contests}
              problemIndexes={problemIndexes}
              submissionStatusMap={submissionStatusMap}
            />
          </div>
          <div className="w-full lg:w-80 lg:sticky lg:top-8 h-fit">
            <ProblemStats stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
