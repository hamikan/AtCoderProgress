import 'server-only';

import { fetchJson } from '@/lib/atcoder/fetch-json';
import { CONTEST_ENDPOINTS } from './endpoints';
import {
  contestProblemsSchema,
  contestsSchema,
  mergedProblemsSchema,
  problemModelsSchema,
} from './schemas';
import type { ContestResources } from './types';

const FETCH_DELAY_MS = 2000;

export async function fetchContestResources(): Promise<ContestResources> {
  const contests = await fetchJson(CONTEST_ENDPOINTS.contests, contestsSchema);
  await sleep(FETCH_DELAY_MS);
  const contestProblems = await fetchJson(
    CONTEST_ENDPOINTS.contestProblems,
    contestProblemsSchema
  );
  await sleep(FETCH_DELAY_MS);
  const mergedProblems = await fetchJson(
    CONTEST_ENDPOINTS.mergedProblems,
    mergedProblemsSchema
  );
  await sleep(FETCH_DELAY_MS);
  const problemModels = await fetchJson(
    CONTEST_ENDPOINTS.problemModels,
    problemModelsSchema
  );
  return { contests, contestProblems, mergedProblems, problemModels };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
