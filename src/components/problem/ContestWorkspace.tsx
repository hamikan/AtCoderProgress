'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ContestTable from '@/components/problem/ContestTable';
import ProblemStats from '@/components/problem/ProblemStats';
import { loadContestPageAction } from '@/lib/actions/contest';
import { DEFAULT_CONTEST_PAGE_SIZE } from '@/lib/validation/contest-page';
import type { Contest, ContestKind, ContestOrder } from '@/types/contest';
import type { ContestStats } from '@/lib/services/db/contest';
import type { SubmissionStatus } from '@/types/submission';

const AUTO_LOAD_DELAY_MS = 800;

interface ContestWorkspaceState {
  contests: Contest[];
  submissionStatusMap: Record<string, SubmissionStatus>;
  stats: ContestStats;
  nextCursor: string | null;
  hasMore: boolean;
}

interface ContestWorkspaceProps extends ContestWorkspaceState {
  contestType: ContestKind;
  order: ContestOrder;
  problemIndexes: string[];
  pageSize?: number;
}

export default function ContestWorkspace({
  contestType,
  order,
  problemIndexes,
  pageSize = DEFAULT_CONTEST_PAGE_SIZE,
  contests,
  submissionStatusMap,
  stats,
  nextCursor,
  hasMore,
}: ContestWorkspaceProps) {
  const [state, setState] = useState<ContestWorkspaceState>({
    contests,
    submissionStatusMap,
    stats,
    nextCursor,
    hasMore,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestedCursorsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setState({
      contests,
      submissionStatusMap,
      stats,
      nextCursor,
      hasMore,
    });
    setLoadError(null);
    setIsLoadingMore(false);
    requestedCursorsRef.current = new Set();
  }, [contestType, order, contests, hasMore, nextCursor, stats, submissionStatusMap]);

  const loadNextPage = useCallback(async () => {
    if (!state.hasMore || !state.nextCursor || isLoadingMore) return;
    if (requestedCursorsRef.current.has(state.nextCursor)) return;

    requestedCursorsRef.current.add(state.nextCursor);
    setIsLoadingMore(true);
    setLoadError(null);

    try {
      const nextPage = await loadContestPageAction({
        contestType,
        order,
        cursor: state.nextCursor,
        limit: pageSize,
      });

      setState((current) => ({
        contests: [...current.contests, ...nextPage.contests],
        submissionStatusMap: {
          ...current.submissionStatusMap,
          ...nextPage.submissionStatusMap,
        },
        stats: current.stats,
        nextCursor: nextPage.nextCursor,
        hasMore: nextPage.hasMore,
      }));
    } catch (error) {
      requestedCursorsRef.current.delete(state.nextCursor);
      console.error('Failed to load more contests', error);
      setLoadError('追加のコンテストを読み込めませんでした。');
    } finally {
      setIsLoadingMore(false);
    }
  }, [contestType, isLoadingMore, order, pageSize, state.hasMore, state.nextCursor]);

  useEffect(() => {
    if (!state.hasMore || !state.nextCursor || isLoadingMore || loadError) return;

    const timerId = window.setTimeout(() => {
      void loadNextPage();
    }, AUTO_LOAD_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [isLoadingMore, loadError, loadNextPage, state.hasMore, state.nextCursor]);

  return (
    <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
      <div className="flex-1">
        <ContestTable
          contestType={contestType}
          contests={state.contests}
          order={order}
          problemIndexes={problemIndexes}
          submissionStatusMap={state.submissionStatusMap}
          footer={
            <div className="flex min-h-16 items-center justify-center pt-4">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  読み込み中
                </div>
              )}
              {loadError && <p className="text-sm text-red-600">{loadError}</p>}
            </div>
          }
        />
      </div>
      <div className="w-full lg:w-80 lg:sticky lg:top-8 h-fit">
        <ProblemStats stats={state.stats} />
      </div>
    </div>
  );
}
