import type {
  ContestResources,
  NormalizedContestData,
} from './types';

// 次のコードを引用・編集して使用しています。
// https://github.com/kenkoooo/AtCoderProblems/blob/master/atcoder-problems-frontend/src/utils/index.ts
const clipDifficulty = (difficulty: number | null) => {
  if (difficulty === null) return null;
  return Math.round(
    difficulty >= 400 ? difficulty : 400 / Math.exp(1.0 - difficulty / 400)
  );
};

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
    difficulty: clipDifficulty(problemModels[problem.id]?.difficulty),
    firstContestId: problem.first_contest_id || problem.contest_id,
  }));

  const normalizedContestProblems = contestProblems.map((cp) => ({
    contestId: cp.contest_id,
    problemId: cp.problem_id,
    problemIndex: cp.problem_index,
  }));

  return {
    contests: normalizedContests,
    problems: normalizedProblems,
    contestProblems: normalizedContestProblems,
  };
}