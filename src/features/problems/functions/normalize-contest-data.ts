import type {
  ContestResources,
} from '@/lib/atcoder/contests/types';
import type { NormalizedContestData } from '@/features/problems/types/input/normalized-contest-data';

import { clipDifficulty } from './difficulty';
import { SUPPLEMENTAL_PROBLEMS } from './supplemental-problems';

export function normalizeContestData(resources: ContestResources): NormalizedContestData {
  const { contests, mergedProblems, contestProblems, problemModels } = resources;

  const normalizedContests = contests.map((contest) => ({
    id: contest.id,
    startEpochSecond: contest.start_epoch_second,
    durationSecond: contest.duration_second,
  }));

  const normalizedProblems = mergedProblems.map((problem) => ({
    id: problem.id,
    name: problem.name,
    difficulty: clipDifficulty(problemModels[problem.id]?.difficulty ?? null),
    firstContestId: problem.first_contest_id || problem.contest_id,
  }));

  const normalizedContestProblems = contestProblems.map((cp) => ({
    contestId: cp.contest_id,
    problemId: cp.problem_id,
    problemIndex: cp.problem_index,
  }));

  const listedProblemIds = new Set(normalizedProblems.map((problem) => problem.id));
  const contestIds = new Set(normalizedContests.map((contest) => contest.id));
  // 問題には最初のコンテストが必要なので、コンテストが一覧にあるものだけを補う
  const supplementalProblems = SUPPLEMENTAL_PROBLEMS.filter(
    (problem) => !listedProblemIds.has(problem.id) && contestIds.has(problem.contestId)
  );

  return {
    contests: normalizedContests,
    problems: [
      ...normalizedProblems,
      ...supplementalProblems.map((problem) => ({
        id: problem.id,
        name: problem.name,
        difficulty: null,
        firstContestId: problem.contestId,
      })),
    ],
    contestProblems: [
      ...normalizedContestProblems,
      ...supplementalProblems.map((problem) => ({
        contestId: problem.contestId,
        problemId: problem.id,
        problemIndex: problem.problemIndex,
      })),
    ],
  };
}
