import 'server-only';

import type { AtCoderFullFetchResult } from '@/features/auth/types';
import type { RatingHistoryResource } from '@/lib/atcoder/ratings/types';
import type { SubmissionResources } from '@/lib/atcoder/submissions/types';

// 1回の実行は 300 秒で打ち切られる。打ち切られると失敗の記録も残せないので、その前に自分で止める
export const FULL_FETCH_TIME_BUDGET_MS = 240_000;

interface SynchronizeAtCoderIdChangeDependencies {
  /** 保存済みの続きから取るための開始時刻（秒）。初めてなら 0 */
  getResumeCursor(): Promise<number>;
  fetchSubmissionPages(
    atcoderId: string,
    fromSecond: number,
    handlePage: (page: SubmissionResources) => Promise<void>,
    signal?: AbortSignal
  ): Promise<void>;
  fetchRatingHistory(
    atcoderId: string,
    signal?: AbortSignal
  ): Promise<RatingHistoryResource[]>;
  savePage(page: SubmissionResources): Promise<void>;
  commit(result: AtCoderFullFetchResult): Promise<void>;
  now?: () => number;
  timeBudgetMs?: number;
}

export class AtCoderProfileFetchError extends Error {
  constructor(cause: unknown) {
    super('Failed to fetch AtCoder profile data', { cause });
    this.name = 'AtCoderProfileFetchError';
  }
}

export class AtCoderFullFetchPausedError extends Error {
  constructor(readonly savedPageCount: number) {
    super('Paused the AtCoder full fetch at the time budget');
    this.name = 'AtCoderFullFetchPausedError';
  }
}

export async function synchronizeAtCoderIdChange(
  atcoderId: string,
  dependencies: SynchronizeAtCoderIdChangeDependencies
): Promise<void> {
  const now = dependencies.now ?? Date.now;
  const timeBudgetMs = dependencies.timeBudgetMs ?? FULL_FETCH_TIME_BUDGET_MS;
  const startedAt = now();
  const fromSecond = await dependencies.getResumeCursor();

  let canonicalName: string | null = null;
  let savedPageCount = 0;
  const saveFetchedPage = async (page: SubmissionResources): Promise<void> => {
    await dependencies.savePage(page);
    savedPageCount += 1;
    canonicalName = page.submissions[0]?.user_id ?? canonicalName;
    if (now() - startedAt > timeBudgetMs) {
      throw new AtCoderFullFetchPausedError(savedPageCount);
    }
  };

  // 片方が失敗したらもう片方も止める。提出の全件取得は、止めないと失敗後も何分もページを取り続ける
  const controller = new AbortController();
  const abortOnFailure = async <Value>(
    run: (signal: AbortSignal) => Promise<Value>
  ): Promise<Value> => {
    try {
      return await run(controller.signal);
    } catch (error) {
      controller.abort();
      throw error;
    }
  };

  let ratingHistory: RatingHistoryResource[];
  try {
    [, ratingHistory] = await Promise.all([
      abortOnFailure((signal) =>
        dependencies.fetchSubmissionPages(atcoderId, fromSecond, saveFetchedPage, signal)
      ),
      abortOnFailure((signal) => dependencies.fetchRatingHistory(atcoderId, signal)),
    ]);
  } catch (error) {
    if (error instanceof AtCoderFullFetchPausedError) {
      throw error;
    }
    throw new AtCoderProfileFetchError(error);
  }

  await dependencies.commit({ ratingHistory, canonicalName });
}
