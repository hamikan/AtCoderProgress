import type { ProblemDetail } from '@/features/problems/types';
import type { SolutionRecordListItem } from '@/features/solutions/types';

export function getDefaultContestId(
  problem: ProblemDetail | null,
  initialContestId: string | null
): string | null {
  if (!problem) {
    return null;
  }

  if (
    initialContestId &&
    problem.contests.some((contest) => contest.contestId === initialContestId)
  ) {
    return initialContestId;
  }

  if (
    problem.contests.some(
      (contest) => contest.contestId === problem.firstContest.id
    )
  ) {
    return problem.firstContest.id;
  }

  return problem.contests[0]?.contestId ?? null;
}

export function formatSolutionRecordLabel(
  record: SolutionRecordListItem,
  index: number
): string {
  return record.title?.trim() || `記録 ${index + 1}`;
}

export function getSolutionEditorKey({
  solutionId,
  problemId,
  contestId,
}: {
  solutionId: string | null;
  problemId: string | null;
  contestId: string | null;
}): string {
  return [
    solutionId ?? 'new',
    problemId ?? 'no-problem',
    contestId ?? 'no-contest',
  ].join(':');
}
