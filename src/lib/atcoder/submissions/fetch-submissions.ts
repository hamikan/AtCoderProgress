import 'server-only';

import { fetchJson } from '@/lib/atcoder/fetch-json';
import { parseAtCoderId } from '@/lib/atcoder/user-id';
import { SUBMISSIONS_ENDPOINT } from './endpoints';
import { collectSubmissions, forEachSubmissionPage } from './paginate-submissions';
import { rawSubmissionsSchema } from './schemas';
import type { SubmissionResources } from './types';

const FETCH_DELAY_MS = 2_000;

function createPageFetcher(atcoderId: string, signal?: AbortSignal) {
  const parsedAtCoderId = parseAtCoderId(atcoderId);
  return (cursor: number) => {
    signal?.throwIfAborted();
    const params = new URLSearchParams({
      from_second: String(cursor),
      user: parsedAtCoderId,
    });
    return fetchJson(
      `${SUBMISSIONS_ENDPOINT}?${params.toString()}`,
      rawSubmissionsSchema,
      { signal }
    );
  };
}

function assertValidCursor(fromSecond: number): void {
  if (!Number.isInteger(fromSecond) || fromSecond < 0) {
    throw new Error('Invalid submission cursor');
  }
}

export async function fetchSubmissions(
  atcoderId: string,
  fromSecond: number,
  signal?: AbortSignal
): Promise<SubmissionResources> {
  assertValidCursor(fromSecond);
  const submissions = await collectSubmissions(
    createPageFetcher(atcoderId, signal),
    fromSecond,
    { waitBetweenPages: () => sleep(FETCH_DELAY_MS) }
  );
  return { submissions };
}

export async function fetchSubmissionPages(
  atcoderId: string,
  fromSecond: number,
  handlePage: (page: SubmissionResources) => Promise<void>,
  signal?: AbortSignal
): Promise<void> {
  assertValidCursor(fromSecond);
  await forEachSubmissionPage(
    createPageFetcher(atcoderId, signal),
    fromSecond,
    (submissions) => handlePage({ submissions }),
    { waitBetweenPages: () => sleep(FETCH_DELAY_MS) }
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
