import type {
  ProblemListItem,
  ProblemListRow,
  ProblemStatus,
} from '@/features/problems/types';

const STATUS_PRIORITY: Record<ProblemStatus, number> = {
  REVIEW_AC: 6,
  SELF_AC: 5,
  EXPLANATION_AC: 4,
  AC: 3,
  TRYING: 2,
  UNSOLVED: 1,
};

function getProblemStatus(row: ProblemListRow, hasUser: boolean): ProblemStatus {
  if (!hasUser) {
    return 'UNSOLVED';
  }

  if (row.solutions.length > 0) {
    return row.solutions.reduce((bestStatus, solution) =>
      STATUS_PRIORITY[solution.status] > STATUS_PRIORITY[bestStatus]
        ? solution.status
        : bestStatus
    , row.solutions[0].status);
  }

  if (row.submissions.length > 0) {
    return 'AC';
  }

  return row._count.submissions > 0 ? 'TRYING' : 'UNSOLVED';
}

export function buildProblemListItems(
  rows: ProblemListRow[],
  userId?: string
): ProblemListItem[] {
  return rows.map((row) => {
    const mainContest = row.contests.find(
      (contest) => contest.contestId === row.firstContestId
    );

    return {
      id: row.id,
      name: row.name,
      contestId: row.firstContestId,
      problemIndex: mainContest?.problemIndex ?? 'unknown',
      difficulty: row.difficulty,
      totalSolutionCount: row.totalSolutionCount,
      status: getProblemStatus(row, Boolean(userId)),
    };
  });
}
