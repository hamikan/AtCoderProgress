'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ContestTable from './ContestTable';
import ProblemStats from './ProblemStats';
import { loadContestChunk } from '@/features/problems/actions/load-contest-chunk';
import type {
  Contest,
  ContestKind,
  ContestOrder,
  ContestStats,
} from '@/features/problems/types';
import type { SubmissionStatus } from '@/features/submissions/types';

interface ContestListEntry {
  contests: Contest[];
  submissionStatusMap: Record<string, SubmissionStatus>;
  totalContests: number;
  nextCursor: string | null;
  hasMore: boolean;
  loadFailed: boolean;
}

interface ContestWorkspaceProps {
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

const contestListCache = new Map<string, ContestListEntry>();
const loadingCacheKeys = new Set<string>();

function contestListCacheKey(contestType: ContestKind, order: ContestOrder): string {
  return `${contestType}:${order}`;
}

export default function ContestWorkspace({
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
  const cacheKey = contestListCacheKey(contestType, order);

  const [lists, setLists] = useState<Map<string, ContestListEntry>>(
    () => new Map(contestListCache)
  );

  const initialEntry: ContestListEntry = {
    contests,
    submissionStatusMap,
    totalContests,
    nextCursor,
    hasMore,
    loadFailed: false,
  };
  const view = lists.get(cacheKey) ?? initialEntry;
  const isLoading = view.hasMore && !view.loadFailed;

  useEffect(() => {
    let entry = contestListCache.get(cacheKey);
    if (!entry) {
      entry = {
        contests,
        submissionStatusMap,
        totalContests,
        nextCursor,
        hasMore,
        loadFailed: false,
      };
      contestListCache.set(cacheKey, entry);
    }

    if (!entry.hasMore || entry.loadFailed || loadingCacheKeys.has(cacheKey)) {
      return;
    }

    loadingCacheKeys.add(cacheKey);
    let current = entry;

    const applyEntry = (next: ContestListEntry) => {
      contestListCache.set(cacheKey, next);
      setLists((previous) => new Map(previous).set(cacheKey, next));
    };

    void (async () => {
      while (current.hasMore) {
        try {
          const chunk = await loadContestChunk({
            contestType,
            order,
            cursor: current.nextCursor,
          });
          current = {
            contests: [...current.contests, ...chunk.contests],
            submissionStatusMap: {
              ...current.submissionStatusMap,
              ...chunk.submissionStatusMap,
            },
            totalContests: chunk.totalContests,
            nextCursor: chunk.nextCursor,
            hasMore: chunk.hasMore && chunk.contests.length > 0,
            loadFailed: false,
          };
        } catch {
          current = { ...current, loadFailed: true };
          applyEntry(current);
          break;
        }

        applyEntry(current);
      }
      loadingCacheKeys.delete(cacheKey);
    })();
  }, [
    cacheKey,
    contestType,
    order,
    contests,
    submissionStatusMap,
    totalContests,
    nextCursor,
    hasMore,
  ]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
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
