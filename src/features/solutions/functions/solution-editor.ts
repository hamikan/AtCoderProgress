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

export function hasUnsavedScopeMove(
  savedScope: { problemId: string; contestId: string } | null,
  currentScope: { problemId: string; contestId: string } | null
): boolean {
  if (!savedScope || !currentScope) {
    return false;
  }

  return (
    savedScope.problemId !== currentScope.problemId ||
    savedScope.contestId !== currentScope.contestId
  );
}

export function formatSolutionRecordLabel(
  record: Pick<SolutionRecordListItem, 'title'>,
  index: number
): string {
  return record.title?.trim() || `記録 ${index + 1}`;
}

export function getPathAfterDeletingRecord({
  records,
  deletedId,
  problemId,
  contestId,
}: {
  records: Pick<SolutionRecordListItem, 'id'>[];
  deletedId: string;
  problemId: string;
  contestId: string | null;
}): string {
  const deletedIndex = records.findIndex((record) => record.id === deletedId);
  const remaining = records.filter((record) => record.id !== deletedId);
  // 一覧にまだ入っていない記録は末尾に出しているため、最後の記録の次にあったものとして扱う
  const position = deletedIndex === -1 ? records.length : deletedIndex;
  const next = remaining[position - 1] ?? remaining[0];
  if (next) {
    return `/solutions/${next.id}`;
  }

  const searchParams = new URLSearchParams({ problemId });
  if (contestId) {
    searchParams.set('contestId', contestId);
  }
  return `/solutions/new?${searchParams}`;
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
