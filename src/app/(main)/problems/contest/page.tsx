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

  const { contests, totalProblems } = await getContestsFromDB(contestType, order);
  const problemIndexes = getProblemIndexes(contestType);

  let submissionStatusMap = {};
  let acCount = 0;
  let tryingCount = 0;

  if (userId) {
    const summary = await getSubmissionSummary(userId, contestType);
    submissionStatusMap = summary.statusMap;
    acCount = summary.acCount;
    tryingCount = summary.tryingCount;
  }

  const stats = {
    total: totalProblems,
    ac: acCount,
    trying: tryingCount,
    unsolved: totalProblems - acCount - tryingCount,
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 h-full">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="flex-1">
            <Suspense fallback={<div className="text-center p-8">Loading contests...</div>}>
              <ContestTable
                contests={contests}
                problemIndexes={problemIndexes}
                submissionStatusMap={submissionStatusMap}
              />
            </Suspense>
          </div>
          <div className="w-full lg:w-80">
            <ProblemStats stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
