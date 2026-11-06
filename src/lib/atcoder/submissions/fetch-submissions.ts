import 'server-only';

import { fetchJson } from '@/lib/atcoder/fetch-json';
import { parseAtCoderId } from '@/lib/atcoder/user-id';
import { SUBMISSIONS_ENDPOINT } from './endpoints';
import { collectSubmissions } from './paginate-submissions';
import { rawSubmissionsSchema } from './schemas';
import type { SubmissionResources } from './types';

const FETCH_DELAY_MS = 2_000;

export async function fetchSubmissions(
  atcoderId: string,
  fromSecond: number,
  signal?: AbortSignal
): Promise<SubmissionResources> {
  const parsedAtCoderId = parseAtCoderId(atcoderId);
  if (!Number.isInteger(fromSecond) || fromSecond < 0) {
    throw new Error('Invalid submission cursor');
  }

  const submissions = await collectSubmissions(
    (cursor) => {
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
    },
    fromSecond,
    { waitBetweenPages: () => sleep(FETCH_DELAY_MS) }
  );
  return { submissions };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
