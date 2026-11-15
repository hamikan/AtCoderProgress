import 'server-only';

import { normalizeContestData } from '@/features/problems/functions/normalize-contest-data';
import type { SyncContestsAndProblemsResult } from '@/features/problems/types/input/contest-data-write-plan';
import { promoteAllPendingSubmissions } from '@/features/submissions/sync/persist-submissions';
import { createLogger } from '@/lib/logger';
import { fetchContestResources } from '@/lib/atcoder/contests/fetch-contest-resources';

import { persistContestsAndProblems } from './persist-contests-and-problems';

const logger = createLogger('problem-sync');

export async function syncContestsAndProblems(): Promise<SyncContestsAndProblemsResult> {
  const raw = await fetchContestResources();
  const normalized = normalizeContestData(raw);
  const persisted = await persistContestsAndProblems(normalized);
  // ダッシュボードを開いて提出を取り直すのを待たずに、問題データが入った時点で数に入れる
  const promotedSubmissionCount = await promoteAllPendingSubmissions();
  const result = { ...persisted, promotedSubmissionCount };
  logger.info('finished', { ...result });
  return result;
}
