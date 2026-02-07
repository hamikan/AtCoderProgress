import { fetchSubmission } from './fetch';
import { persistSubmissionData } from './persist';

export async function syncSubmission(userId: string, atcoderId: string, fromSecond: number) {
  const raw = await fetchSubmission(atcoderId, fromSecond);
  await persistSubmissionData(userId, raw);
}
