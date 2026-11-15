import type {
  ContestDataWritePlan,
  StoredContestData,
} from '@/features/problems/types/input/contest-data-write-plan';
import type { NormalizedContestData } from '@/features/problems/types/input/normalized-contest-data';

import { resolveProblemDifficulty } from './difficulty';

const contestProblemKey = (contestId: string, problemId: string) => `${contestId}\u0000${problemId}`;

// 取得に失敗したり一覧から外れたりしても失わないよう、保存済みにしかない行は消さず、difficulty も空では上書きしない
export function planContestDataWrites(
  stored: StoredContestData,
  incoming: NormalizedContestData
): ContestDataWritePlan {
  const storedContests = new Map(stored.contests.map((contest) => [contest.id, contest]));
  const incomingContests = [...new Map(incoming.contests.map((contest) => [contest.id, contest])).values()];
  const contestsToCreate = incomingContests.filter((contest) => !storedContests.has(contest.id));
  const contestsToUpdate = incomingContests.filter((contest) => {
    const current = storedContests.get(contest.id);
    return (
      current !== undefined &&
      (current.startEpochSecond !== contest.startEpochSecond ||
        current.durationSecond !== contest.durationSecond)
    );
  });
  const knownContestIds = new Set([...storedContests.keys(), ...incomingContests.map((contest) => contest.id)]);

  const storedProblems = new Map(stored.problems.map((problem) => [problem.id, problem]));
  const incomingProblems = [...new Map(incoming.problems.map((problem) => [problem.id, problem])).values()];
  // 問題は最初のコンテストがないと保存できない
  const savableProblems = incomingProblems.filter((problem) => knownContestIds.has(problem.firstContestId));
  const resolvedProblems = savableProblems.map((problem) => {
    const current = storedProblems.get(problem.id);
    const difficulty = resolveProblemDifficulty(current?.customDifficulty ?? null, problem.difficulty);
    return {
      id: problem.id,
      name: problem.name,
      difficulty: difficulty ?? current?.difficulty ?? null,
      firstContestId: problem.firstContestId,
    };
  });
  const problemsToCreate = resolvedProblems.filter((problem) => !storedProblems.has(problem.id));
  const problemsToUpdate = resolvedProblems.filter((problem) => {
    const current = storedProblems.get(problem.id);
    return (
      current !== undefined &&
      (current.name !== problem.name ||
        current.difficulty !== problem.difficulty ||
        current.firstContestId !== problem.firstContestId)
    );
  });
  const knownProblemIds = new Set([...storedProblems.keys(), ...problemsToCreate.map((problem) => problem.id)]);

  const storedContestProblems = new Map(
    stored.contestProblems.map((row) => [contestProblemKey(row.contestId, row.problemId), row])
  );
  const incomingContestProblems = [
    ...new Map(
      incoming.contestProblems.map((row) => [contestProblemKey(row.contestId, row.problemId), row])
    ).values(),
  ];
  const savableContestProblems = incomingContestProblems.filter(
    (row) => knownContestIds.has(row.contestId) && knownProblemIds.has(row.problemId)
  );
  const contestProblemsToCreate = savableContestProblems.filter(
    (row) => !storedContestProblems.has(contestProblemKey(row.contestId, row.problemId))
  );
  const contestProblemsToUpdate = savableContestProblems.filter((row) => {
    const current = storedContestProblems.get(contestProblemKey(row.contestId, row.problemId));
    return current !== undefined && current.problemIndex !== row.problemIndex;
  });

  return {
    contestsToCreate,
    contestsToUpdate,
    problemsToCreate,
    problemsToUpdate,
    contestProblemsToCreate,
    contestProblemsToUpdate,
    skippedProblemCount: incomingProblems.length - savableProblems.length,
    skippedContestProblemCount: incomingContestProblems.length - savableContestProblems.length,
  };
}
