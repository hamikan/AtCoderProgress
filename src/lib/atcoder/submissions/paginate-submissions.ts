import type { RawSubmission } from './types';

export type FetchSubmissionPage = (
  cursor: number
) => Promise<RawSubmission[]>;

export interface CollectSubmissionsOptions {
  pageSize?: number;
  maxPages?: number;
  waitBetweenPages?: () => Promise<void>;
}

const DEFAULT_PAGE_SIZE = 500;
const DEFAULT_MAX_PAGES = 200;

export type HandleSubmissionPage = (newSubmissions: RawSubmission[]) => Promise<void> | void;

// 全件を集めてから保存すると、途中で止まったときに何も残らない。1ページごとに渡して、その場で保存できるようにする
export async function forEachSubmissionPage(
  fetchPage: FetchSubmissionPage,
  initialCursor: number,
  handlePage: HandleSubmissionPage,
  options: CollectSubmissionsOptions = {}
): Promise<void> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;

  const seenIds = new Set<number>();
  let cursor = initialCursor;

  for (let page = 1; ; page += 1) {
    if (page > maxPages) {
      throw new Error('Submission pagination limit exceeded');
    }
    if (page > 1 && options.waitBetweenPages) {
      await options.waitBetweenPages();
    }

    const pageItems = await fetchPage(cursor);
    const newItems: RawSubmission[] = [];
    for (const item of pageItems) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        newItems.push(item);
      }
    }
    if (newItems.length > 0) {
      await handlePage(newItems);
    }

    if (pageItems.length < pageSize) {
      return;
    }

    const lastSubmission = pageItems.at(-1);
    if (!lastSubmission || lastSubmission.epoch_second < cursor) {
      throw new Error('Invalid submission pagination response');
    }

    // 同じ秒の提出だけで1ページが埋まると先へ進めないので、そこで止める
    if (newItems.length === 0 && lastSubmission.epoch_second === cursor) {
      return;
    }

    // +1 すると境目と同じ秒の残りを取りこぼすため、同じ秒から取り直す（重なりは ID で除く）
    cursor = lastSubmission.epoch_second;
  }
}

export async function collectSubmissions(
  fetchPage: FetchSubmissionPage,
  initialCursor: number,
  options: CollectSubmissionsOptions = {}
): Promise<RawSubmission[]> {
  const collected: RawSubmission[] = [];
  await forEachSubmissionPage(
    fetchPage,
    initialCursor,
    (newSubmissions) => {
      collected.push(...newSubmissions);
    },
    options
  );
  return collected;
}
