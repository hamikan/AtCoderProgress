import Link from 'next/link';
import ContestTable from './ContestTable';
import ProblemStats from './ProblemStats';
import type {
  Contest,
  ContestKind,
  ContestOrder,
  ContestStats,
} from '@/features/problems/types';
import type { SubmissionStatus } from '@/features/submissions/types';

interface ContestWorkspaceProps {
  readonly contestType: ContestKind;
  readonly order: ContestOrder;
  readonly problemIndexes: string[];
  readonly contests: Contest[];
  readonly submissionStatusMap: Record<string, SubmissionStatus>;
  readonly stats: ContestStats;
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

export default function ContestWorkspace({
  contestType,
  order,
  problemIndexes,
  contests,
  submissionStatusMap,
  stats,
  nextCursor,
  hasMore,
}: ContestWorkspaceProps) {
  const nextPageHref = nextCursor
    ? `/problems/contest?${new URLSearchParams({ contestType, order, cursor: nextCursor })}`
    : null;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <ContestTable
          contestType={contestType}
          contests={contests}
          order={order}
          problemIndexes={problemIndexes}
          submissionStatusMap={submissionStatusMap}
          footer={
            hasMore && nextPageHref ? (
              <div className="flex min-h-16 items-center justify-center pt-4">
                <Link
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  href={nextPageHref}
                >
                  次のコンテストを表示
                </Link>
              </div>
            ) : null
          }
        />
      </div>
      <div className="h-fit w-full lg:sticky lg:top-8 lg:w-80">
        <ProblemStats stats={stats} />
      </div>
    </div>
  );
}
