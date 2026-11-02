import type { RawSubmission } from './types';

export type FetchSubmissionPage = (
  cursor: number
) => Promise<RawSubmission[]>;

export interface CollectSubmissionsOptions {
  pageSize?: number;
  maxPages?: number;
  /** Called before fetching each page after the first (rate limiting). */
  waitBetweenPages?: () => Promise<void>;
}

const DEFAULT_PAGE_SIZE = 500;
const DEFAULT_MAX_PAGES = 200;

/**
 * Walks the submissions API page by page and returns every submission
 * exactly once.
 *
 * The next page starts at the last submission's `epoch_second` WITHOUT
 * adding 1. Adding 1 would skip submissions that share the boundary
 * second whenever a page ends in the middle of that second, and they
 * could never be recovered (issue #117). The overlap this creates is
 * removed by submission ID.
 *
 * If a full page consists only of already-seen submissions at the
 * cursor's second, the cursor cannot advance any further; the walk
 * stops with what it has instead of looping forever.
 */
export async function collectSubmissions(
  fetchPage: FetchSubmissionPage,
  initialCursor: number,
  options: CollectSubmissionsOptions = {}
): Promise<RawSubmission[]> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;

  const seenIds = new Set<number>();
  const collected: RawSubmission[] = [];
  let cursor = initialCursor;

  for (let page = 1; ; page += 1) {
    if (page > maxPages) {
      throw new Error('Submission pagination limit exceeded');
    }
    if (page > 1 && options.waitBetweenPages) {
      await options.waitBetweenPages();
    }

    const pageItems = await fetchPage(cursor);
    let newCount = 0;
    for (const item of pageItems) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        collected.push(item);
        newCount += 1;
      }
    }

    if (pageItems.length < pageSize) {
      return collected;
    }

    const lastSubmission = pageItems.at(-1);
    if (!lastSubmission || lastSubmission.epoch_second < cursor) {
      throw new Error('Invalid submission pagination response');
    }

    if (newCount === 0 && lastSubmission.epoch_second === cursor) {
      return collected;
    }

    cursor = lastSubmission.epoch_second;
  }
}
