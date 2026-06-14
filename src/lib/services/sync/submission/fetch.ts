import { SUBMISSION_ENDPOINTS } from '../providers/kenkoooo/endpoints';
import type {
  RawSubmission,
  SubmissionResources
} from './type';
import {
  sleep,
  fetchJson
} from '../utils'
import { normalizeAtCoderId } from '@/lib/validation/atcoder-id';

const limit = 500;
const FETCH_DELAY_MS = 2000;

export async function fetchSubmission(atcoderId: string, fromSecond: number): Promise<SubmissionResources> {
  const normalizedAtCoderId = normalizeAtCoderId(atcoderId);
  if (!Number.isInteger(fromSecond) || fromSecond < 0) {
    throw new Error('Invalid submission cursor');
  }

  const submissions: Array<RawSubmission> = [];
  while (true) {
    const params = new URLSearchParams({
      from_second: String(fromSecond),
      user: normalizedAtCoderId,
    });
    const url = `${SUBMISSION_ENDPOINTS.SUBMISSIONS}?${params.toString()}`;
    const newSubmissions: Array<RawSubmission> = await fetchJson<Array<RawSubmission>>(url);
    if (newSubmissions.length === 0) break;
    submissions.push(...newSubmissions);

    if (newSubmissions.length < limit) break;

    fromSecond = newSubmissions[newSubmissions.length - 1].epoch_second + 1;
    await sleep(FETCH_DELAY_MS);
  }
  return { submissions };
}
