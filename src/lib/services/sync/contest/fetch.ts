import { CONTEST_ENDPOINTS } from "../providers/kenkoooo/endpoints";
import type {
  ContestResources,
  RawContest,
  RawContestProblem,
  RawProblemModel,
  RawMergedProblem,
} from './types';
import {
  sleep,
  fetchJson
} from '../utils'

const FETCH_DELAY_MS = 2000;

export async function fetchContestResources(): Promise<ContestResources> {
  const contests = await fetchJson<Array<RawContest>>(CONTEST_ENDPOINTS.CONTESTS);
  await sleep(FETCH_DELAY_MS);
  const contestProblems = await fetchJson<Array<RawContestProblem>>(CONTEST_ENDPOINTS.CONTEST_PROBLEMS);
  await sleep(FETCH_DELAY_MS);
  const mergedProblems = await fetchJson<Array<RawMergedProblem>>(CONTEST_ENDPOINTS.MERGED_PROBLEMS);
  await sleep(FETCH_DELAY_MS);
  const problemModels = await fetchJson<Record<string, RawProblemModel>>(CONTEST_ENDPOINTS.PROBLEM_MODELS);
  return { contests, contestProblems, mergedProblems, problemModels };
}
