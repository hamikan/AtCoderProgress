import { fetchContestResources } from './fetch';
import { normalizeContestData } from './normalize';
import { persistContestData } from './persist';

export async function syncContestAndProblems() {
  const raw = await fetchContestResources();
  const normalized = normalizeContestData(raw);
  await persistContestData(normalized);
}
