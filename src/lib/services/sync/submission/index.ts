import { fetchSubmission } from './fetch';
import { persistSubmissionData } from './persist';
import { normalizeAtCoderId } from '@/lib/validation/atcoder-id';

export async function syncSubmission(userId: string, atcoderId: string, fromSecond: number) {
  const normalizedAtCoderId = normalizeAtCoderId(atcoderId);
  const raw = await fetchSubmission(normalizedAtCoderId, fromSecond);
  return persistSubmissionData(userId, normalizedAtCoderId, raw);
}
