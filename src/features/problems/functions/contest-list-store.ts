import type {
  ContestChunkInput,
  ContestKind,
  ContestListEntry,
  ContestOrder,
  ContestPageResult,
} from '@/features/problems/types';

const contestListCache = new Map<string, ContestListEntry>();
const loadingCacheKeys = new Set<string>();
const contestListListeners = new Set<() => void>();

function notifyContestListListeners(): void {
  for (const listener of contestListListeners) {
    listener();
  }
}

export function subscribeContestList(listener: () => void): () => void {
  contestListListeners.add(listener);
  return () => {
    contestListListeners.delete(listener);
  };
}

export function getContestListEntry(
  cacheKey: string,
): ContestListEntry | undefined {
  return contestListCache.get(cacheKey);
}

export function setContestListEntry(
  cacheKey: string,
  entry: ContestListEntry,
): void {
  contestListCache.set(cacheKey, entry);
  notifyContestListListeners();
}

export function seedContestListEntry(
  cacheKey: string,
  entry: ContestListEntry,
): ContestListEntry {
  const existing = contestListCache.get(cacheKey);
  if (existing) {
    return existing;
  }
  contestListCache.set(cacheKey, entry);
  return entry;
}

export function tryStartContestListLoading(cacheKey: string): boolean {
  if (loadingCacheKeys.has(cacheKey)) {
    return false;
  }
  loadingCacheKeys.add(cacheKey);
  return true;
}

export async function loadRemainingContestLists(options: {
  cacheKey: string;
  contestType: ContestKind;
  order: ContestOrder;
  loadChunk: (input: ContestChunkInput) => Promise<ContestPageResult>;
}): Promise<void> {
  const { cacheKey, contestType, order, loadChunk } = options;
  let current = contestListCache.get(cacheKey);
  if (!current) {
    return;
  }

  try {
    while (current.hasMore) {
      try {
        const chunk = await loadChunk({
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
        setContestListEntry(cacheKey, current);
        break;
      }

      setContestListEntry(cacheKey, current);
    }
  } finally {
    loadingCacheKeys.delete(cacheKey);
  }
}
