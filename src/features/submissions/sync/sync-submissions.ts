import 'server-only';

import { fetchSubmissions } from '@/lib/atcoder/submissions/fetch-submissions';
import { parseAtCoderId, toAtCoderAccountId } from '@/lib/atcoder/user-id';
import { persistSubmissions } from './persist-submissions';

export async function syncSubmissions(atcoderId: string, fromSecond: number) {
  const parsedAtCoderId = parseAtCoderId(atcoderId);
  const submissions = await fetchSubmissions(parsedAtCoderId, fromSecond);
  await persistSubmissions(
    toAtCoderAccountId(parsedAtCoderId),
    parsedAtCoderId,
    submissions
  );
}
