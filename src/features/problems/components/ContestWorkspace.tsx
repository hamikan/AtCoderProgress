'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContestTable from './ContestTable';
import ProblemStats from './ProblemStats';
import { loadContestChunk } from '@/features/problems/actions/load-contest-chunk';
import {
  getContestListEntry,
  loadRemainingContestLists,
  seedContestListEntry,
  subscribeContestList,
  tryStartContestListLoading,
} from '@/features/problems/functions/contest-list-store';
import { buildContestListCacheKey } from '@/features/problems/functions/contest-workspace';
import type {
  Contest,
  ContestKind,
  ContestListEntry,
  ContestOrder,
  ContestStats,
} from '@/features/problems/types';
import type { SubmissionStatus } from '@/features/submissions/types';

interface ContestWorkspaceProps {
  readonly cacheScope: string;
  readonly contestType: ContestKind;
  readonly order: ContestOrder;
  readonly problemIndexes: string[];
  readonly contests: Contest[];
  readonly submissionStatusMap: Record<string, SubmissionStatus>;
  readonly stats: ContestStats;
  readonly totalContests: number;
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

export default function ContestWorkspace({
  cacheScope,
  contestType,
  order,
  problemIndexes,
  contests,
  submissionStatusMap,
  stats,
  totalContests,
  nextCursor,
  hasMore,
}: ContestWorkspaceProps) {
  const cacheKey = buildContestListCacheKey(cacheScope, contestType, order);

  const initialEntry = useMemo<ContestListEntry>(
    () => ({
      contests,
      submissionStatusMap,
      totalContests,
      nextCursor,
      hasMore,
      loadFailed: false,
    }),
    [contests, submissionStatusMap, totalContests, nextCursor, hasMore],
  );

  const view = useSyncExternalStore(
    subscribeContestList,
    () => getContestListEntry(cacheKey) ?? initialEntry,
    () => initialEntry,
  );
  const isLoading = view.hasMore && !view.loadFailed;

  const startLoading = useCallback(() => {
    if (!tryStartContestListLoading(cacheKey)) {
      return;
    }

    void loadRemainingContestLists({
      cacheKey,
      contestType,
      order,
      loadChunk: loadContestChunk,
    });
  }, [cacheKey, contestType, order]);

  // 失敗が残っていても、画面を開き直したときは続きから読み直す
  useEffect(() => {
    const entry = seedContestListEntry(cacheKey, initialEntry);
    if (!entry.hasMore) {
      return;
    }
    startLoading();
  }, [cacheKey, initialEntry, startLoading]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <ContestTable
          contestType={contestType}
          contests={view.contests}
          order={order}
          problemIndexes={problemIndexes}
          submissionStatusMap={view.submissionStatusMap}
          footer={
            isLoading ? (
              <div className="flex min-h-16 items-center justify-center gap-2 pt-4">
                <Loader2 className="size-4 animate-spin text-slate-400" />
                <span className="text-sm text-slate-500">
                  残りのコンテストを読み込み中…（{view.contests.length} / {view.totalContests}件）
                </span>
              </div>
            ) : view.hasMore && view.loadFailed ? (
              <div className="flex min-h-16 items-center justify-center gap-3 pt-4">
                <span className="text-sm text-slate-500">続きを読み込めませんでした</span>
                <Button type="button" variant="outline" size="sm" onClick={startLoading}>
                  もう一度読み込む
                </Button>
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
