import 'server-only';

import { fetchSubmissions } from '@/lib/atcoder/submissions/fetch-submissions';
import { parseAtCoderId } from '@/lib/atcoder/user-id';
import { persistSubmissions } from './persist-submissions';

export async function syncSubmissions(userId: string, atcoderId: string, fromSecond: number) {
  const parsedAtCoderId = parseAtCoderId(atcoderId);
  const submissions = await fetchSubmissions(parsedAtCoderId, fromSecond);
  return persistSubmissions(userId, parsedAtCoderId, submissions);
}
