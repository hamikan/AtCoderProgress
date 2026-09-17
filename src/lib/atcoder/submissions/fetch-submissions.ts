import 'server-only';

import { fetchJson } from '@/lib/atcoder/fetch-json';
import { parseAtCoderId } from '@/lib/atcoder/user-id';
import { SUBMISSIONS_ENDPOINT } from './endpoints';
import { rawSubmissionsSchema } from './schemas';
import type { RawSubmission, SubmissionResources } from './types';

const PAGE_SIZE = 500;
const FETCH_DELAY_MS = 2_000;
const MAX_PAGES = 200;

export async function fetchSubmissions(
  atcoderId: string,
  fromSecond: number
): Promise<SubmissionResources> {
  const parsedAtCoderId = parseAtCoderId(atcoderId);
  if (!Number.isInteger(fromSecond) || fromSecond < 0) {
    throw new Error('Invalid submission cursor');
  }

  const submissions = await fetchSubmissionPages({
    atcoderId: parsedAtCoderId,
    cursor: fromSecond,
    page: 1,
    submissions: [],
  });
  return { submissions };
}

async function fetchSubmissionPages({
  atcoderId,
  cursor,
  page,
  submissions,
}: {
  atcoderId: string;
  cursor: number;
  page: number;
  submissions: RawSubmission[];
}): Promise<RawSubmission[]> {
  if (page > MAX_PAGES) {
    throw new Error('Submission pagination limit exceeded');
  }

  const params = new URLSearchParams({
    from_second: String(cursor),
    user: atcoderId,
  });
  const pageItems = await fetchJson(
    `${SUBMISSIONS_ENDPOINT}?${params.toString()}`,
    rawSubmissionsSchema
  );
  const nextSubmissions = [...submissions, ...pageItems];

  if (pageItems.length < PAGE_SIZE) {
    return nextSubmissions;
  }

  const lastSubmission = pageItems.at(-1);
  if (!lastSubmission || lastSubmission.epoch_second < cursor) {
    throw new Error('Invalid submission pagination response');
  }

  await sleep(FETCH_DELAY_MS);
  return fetchSubmissionPages({
    atcoderId,
    cursor: lastSubmission.epoch_second + 1,
    page: page + 1,
    submissions: nextSubmissions,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
