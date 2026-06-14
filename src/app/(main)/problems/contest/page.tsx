import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import ContestWorkspace from '@/components/problem/ContestWorkspace';
import { getContestWorkspaceData } from '@/lib/services/db/contest';
import type { ContestKind } from '@/types/contest';
import { normalizeContestSearchParams } from './search-params';

const getProblemIndexes = (contestType: ContestKind) => {
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
  const { contestType, order } = normalizeContestSearchParams(await searchParams);

  const contestPage = await getContestWorkspaceData(contestType, order, {
    userId,
  });
  const problemIndexes = getProblemIndexes(contestType);

  return (
    <div className="bg-slate-50 h-full overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <ContestWorkspace
          contestType={contestType}
          order={order}
          problemIndexes={problemIndexes}
          contests={contestPage.contests}
          submissionStatusMap={contestPage.submissionStatusMap}
          stats={contestPage.stats}
          nextCursor={contestPage.nextCursor}
          hasMore={contestPage.hasMore}
        />
      </div>
    </div>
  );
}
