import { buildFirstAcceptedByProblem } from './curriculum';
import { formatEpochDate } from './utils';
import type {
  FirstAcceptedProblem,
  RatingHistoryRow,
  SubmissionRow,
} from '@/features/ratings/types/input/account-journey-rows';
import type {
  AnalyticsSummary,
  RatingBandSummary,
} from '@/features/ratings/types/output/account-journey';

export function buildAnalyticsSummary(
  ratingHistory: RatingHistoryRow[],
  submissions: SubmissionRow[],
  bandSummaries: RatingBandSummary[],
  firstAcceptedByProblem: Map<string, FirstAcceptedProblem> = buildFirstAcceptedByProblem(submissions)
): AnalyticsSummary {
  const attemptedCount = new Set(
    submissions.map((submission) => submission.problemId)
  ).size;
  const acCount = firstAcceptedByProblem.size;
  const activeDays = new Set(
    submissions.map((submission) => formatEpochDate(submission.epochSecond))
  ).size;

  return {
    acCount,
    attemptedCount,
    activeDays,
    ratedContestCount: ratingHistory.length,
    activeBandCount: bandSummaries.length,
  };
}
