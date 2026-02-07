import { SUBMISSION_ENDPOINTS } from '../providers/kenkoooo/endpoints';
import type {
  RawSubmission,
  SubmissionResources
} from './type';
import {
  sleep,
  fetchJson
} from '../utils'

const limit = 500;
const FETCH_DELAY_MS = 2000;

export async function fetchSubmission(atcoderId: string, fromSecond: number): Promise<SubmissionResources> {
  const submissions: Array<RawSubmission> = [];
  while (true) {
    const url = `${SUBMISSION_ENDPOINTS.SUBMISSIONS}?user=${atcoderId}&from_second=${fromSecond}`;
    const newSubmissions: Array<RawSubmission> = await fetchJson<Array<RawSubmission>>(url);
    if (newSubmissions.length === 0) break;
    submissions.push(...newSubmissions);

    if (newSubmissions.length < limit) break;

    fromSecond = newSubmissions[newSubmissions.length - 1].epoch_second + 1;
    await sleep(FETCH_DELAY_MS);
  }
  return { submissions };
}
