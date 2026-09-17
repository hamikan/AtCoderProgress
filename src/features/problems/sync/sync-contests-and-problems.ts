import 'server-only';

import { normalizeContestData } from '@/features/problems/functions/normalize-contest-data';
import { fetchContestResources } from '@/lib/atcoder/contests/fetch-contest-resources';

import { persistContestsAndProblems } from './persist-contests-and-problems';

export async function syncContestsAndProblems() {
  const raw = await fetchContestResources();
  const normalized = normalizeContestData(raw);
  await persistContestsAndProblems(normalized);
}
