import 'server-only';

import { normalizeContestData } from '@/features/problems/functions/normalize-contest-data';
import { promoteAllPendingSubmissions } from '@/features/submissions/sync/persist-submissions';
import { fetchContestResources } from '@/lib/atcoder/contests/fetch-contest-resources';

import { persistContestsAndProblems } from './persist-contests-and-problems';

export async function syncContestsAndProblems() {
  const raw = await fetchContestResources();
  const normalized = normalizeContestData(raw);
  await persistContestsAndProblems(normalized);
  // 問題データ待ちで取っておいた提出は、取り直しても範囲から外れていて拾えないため、ここで移す
  const promotedCount = await promoteAllPendingSubmissions();
  if (promotedCount > 0) {
    console.log(`Moved ${promotedCount} pending submission(s) now that their problems are imported.`);
  }
}
