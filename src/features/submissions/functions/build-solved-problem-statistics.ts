import {
  formatTokyoDate,
  formatTokyoDateParts,
  getTokyoDateParts,
  getTokyoMonthStartEpochSecond,
  shiftTokyoDateParts,
} from '@/lib/date/tokyo-date';
import type {
  AcceptedSubmissionRow,
  SolvedProblemStatistics,
} from '@/features/submissions/types';

export function buildSolvedProblemStatistics(
  submissions: readonly AcceptedSubmissionRow[],
  now: Date
): SolvedProblemStatistics {
  const startOfCurrentMonthEpoch = getTokyoMonthStartEpochSecond(now, 0);
  const startOfLastMonthEpoch = getTokyoMonthStartEpochSecond(now, -1);

  const firstAcceptedAt = new Map<string, number>();
  const currentMonthProblems = new Set<string>();
  const lastMonthProblems = new Set<string>();
  const acceptedDates = new Set<string>();

  for (const submission of submissions) {
    const previousFirstAcceptedAt = firstAcceptedAt.get(submission.problemId);
    if (
      previousFirstAcceptedAt === undefined ||
      submission.epochSecond < previousFirstAcceptedAt
    ) {
      firstAcceptedAt.set(submission.problemId, submission.epochSecond);
    }

    if (submission.epochSecond >= startOfCurrentMonthEpoch) {
      currentMonthProblems.add(submission.problemId);
    } else if (submission.epochSecond >= startOfLastMonthEpoch) {
      lastMonthProblems.add(submission.problemId);
    }

    acceptedDates.add(formatTokyoDate(new Date(submission.epochSecond * 1000)));
  }

  const acCountChange = [...firstAcceptedAt.values()].filter(
    (epochSecond) => epochSecond >= startOfCurrentMonthEpoch
  ).length;

  return {
    acCount: firstAcceptedAt.size,
    acCountChange,
    currentStreak: calculateCurrentStreak(acceptedDates, now),
    monthlySolved: currentMonthProblems.size,
    monthlySolvedChange: currentMonthProblems.size - lastMonthProblems.size,
  };
}

function calculateCurrentStreak(
  acceptedDates: ReadonlySet<string>,
  now: Date
): number {
  let startParts = getTokyoDateParts(now);
  if (!acceptedDates.has(formatTokyoDateParts(startParts))) {
    startParts = shiftTokyoDateParts(startParts, -1);
  }

  for (let days = 0; ; days += 1) {
    if (
      !acceptedDates.has(
        formatTokyoDateParts(shiftTokyoDateParts(startParts, -days))
      )
    ) {
      return days;
    }
  }
}
