import type { Metadata } from 'next';
import { getCurrentUser } from '@/features/auth/api/get-current-user';
import LinkAtCoderPrompt from '@/features/auth/components/LinkAtCoderPrompt';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import ContestWorkspace from '@/features/problems/components/ContestWorkspace';
import { getContestWorkspace } from '@/features/problems/api/get-contest-workspace';
import { INITIAL_CONTEST_PAGE_SIZE } from '@/features/problems/functions/contest-page-params';
import { buildContestCacheScope } from '@/features/problems/functions/contest-workspace';
import { getContestProblemIndexes } from '@/features/problems/functions/get-contest-problem-indexes';
import { normalizeContestSearchParams } from '@/features/problems/functions/normalize-contest-search-params';
import type { ContestSearchParamsInput } from '@/features/problems/types';

export const metadata: Metadata = { title: '問題一覧' };

interface ContestPageProps {
  searchParams: Promise<ContestSearchParamsInput>;
}

export default async function ContestPage({ searchParams }: ContestPageProps) {
  const user = await getCurrentUser();
  const { contestType, order } = normalizeContestSearchParams(await searchParams);

  const contestPage = await getContestWorkspace(contestType, order, {
    atcoderAccountId: user?.atcoderAccountId,
    pageSize: INITIAL_CONTEST_PAGE_SIZE,
  });
  const problemIndexes = getContestProblemIndexes(contestType);

  return (
    <div className="bg-slate-50 h-full overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {!user && (
          <div className="mb-6">
            <LoginPrompt
              returnTo="/problems/contest"
              description="ログインすると、問題ごとの挑戦状況や正解状況を表示できます。"
            />
          </div>
        )}
        {user && !user.atcoderId && (
          <div className="mb-6">
            <LinkAtCoderPrompt />
          </div>
        )}
        <ContestWorkspace
          cacheScope={buildContestCacheScope(user, contestPage.submissionsLastFetchedAt)}
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
