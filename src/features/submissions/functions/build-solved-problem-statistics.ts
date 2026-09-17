import { format, startOfMonth, subDays } from 'date-fns';

import type {
  AcceptedSubmissionRow,
  SolvedProblemStatistics,
} from '@/features/submissions/types';

export function buildSolvedProblemStatistics(
  submissions: readonly AcceptedSubmissionRow[],
  now: Date
): SolvedProblemStatistics {
  const startOfCurrentMonth = startOfMonth(now);
  const startOfLastMonth = startOfMonth(subDays(startOfCurrentMonth, 1));
  const startOfCurrentMonthEpoch = Math.floor(
    startOfCurrentMonth.getTime() / 1000
  );
  const startOfLastMonthEpoch = Math.floor(
    startOfLastMonth.getTime() / 1000
  );

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

    acceptedDates.add(
      format(new Date(submission.epochSecond * 1000), 'yyyy-MM-dd')
    );
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
  const start = acceptedDates.has(format(now, 'yyyy-MM-dd'))
    ? now
    : subDays(now, 1);

  for (let days = 0; ; days += 1) {
    if (!acceptedDates.has(format(subDays(start, days), 'yyyy-MM-dd'))) {
      return days;
    }
  }
}
