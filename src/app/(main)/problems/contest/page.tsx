import { getCurrentUser } from '@/features/auth/api/get-current-user';
import ContestWorkspace from '@/features/problems/components/ContestWorkspace';
import { getContestWorkspace } from '@/features/problems/api/get-contest-workspace';
import { INITIAL_CONTEST_PAGE_SIZE } from '@/features/problems/functions/contest-page-params';
import { getContestProblemIndexes } from '@/features/problems/functions/get-contest-problem-indexes';
import { normalizeContestSearchParams } from '@/features/problems/functions/normalize-contest-search-params';
import type { ContestSearchParamsInput } from '@/features/problems/types';

interface ContestPageProps {
  searchParams: Promise<ContestSearchParamsInput>;
}

export default async function ContestPage({ searchParams }: ContestPageProps) {
  const user = await getCurrentUser();
  const userId = user?.id;
  const { contestType, order } = normalizeContestSearchParams(await searchParams);

  const contestPage = await getContestWorkspace(contestType, order, {
    userId,
    pageSize: INITIAL_CONTEST_PAGE_SIZE,
  });
  const problemIndexes = getContestProblemIndexes(contestType);

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
          totalContests={contestPage.totalContests}
          nextCursor={contestPage.nextCursor}
          hasMore={contestPage.hasMore}
        />
      </div>
    </div>
  );
}
