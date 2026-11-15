import 'server-only';

import { fetchSubmissions } from '@/lib/atcoder/submissions/fetch-submissions';
import { parseAtCoderId, toAtCoderAccountId } from '@/lib/atcoder/user-id';
import type { PersistSubmissionsResult } from '@/features/submissions/types';

import { persistSubmissions } from './persist-submissions';

export async function syncSubmissions(
  atcoderId: string,
  fromSecond: number
): Promise<PersistSubmissionsResult> {
  const parsedAtCoderId = parseAtCoderId(atcoderId);
  const submissions = await fetchSubmissions(parsedAtCoderId, fromSecond);
  return persistSubmissions(
    toAtCoderAccountId(parsedAtCoderId),
    parsedAtCoderId,
    submissions
  );
}
