import 'server-only';

import { prisma } from '@/lib/prisma';
import { RECOMMENDED_EXACT_CONTEST_IDS } from '@/features/ratings/functions/account-journey/constants';
import {
  buildCurriculumSections,
  buildFirstAcceptedByProblem,
} from '@/features/ratings/functions/account-journey/curriculum';
import {
  buildRatingBandSummaries,
} from '@/features/ratings/functions/account-journey/rating-band-summaries';
import { buildAnalyticsSummary } from '@/features/ratings/functions/account-journey/analytics-summary';
import { buildRatingFitness } from '@/features/ratings/functions/account-journey/rating-fitness';
import type { AccountJourneyAnalytics } from '@/features/ratings/types';

export async function getAccountJourneyAnalytics(
  userId?: string
): Promise<AccountJourneyAnalytics> {
  const [ratingHistory, submissions, curriculumRows] = await Promise.all([
    userId ? prisma.userRatingHistory.findMany({
      where: { userId },
      orderBy: { endTime: 'asc' },
      select: {
        oldRating: true,
        newRating: true,
        performance: true,
        contestName: true,
        contestScreenName: true,
        endTime: true,
      },
    }) : [],
    userId ? prisma.submission.findMany({
      where: {
        userId,
        NOT: {
          contestId: { startsWith: 'ahc' },
        },
      },
      orderBy: { epochSecond: 'asc' },
      select: {
        problemId: true,
        contestId: true,
        result: true,
        epochSecond: true,
        problem: {
          select: {
            id: true,
            name: true,
            difficulty: true,
          },
        },
      },
    }) : [],
    prisma.contestProblem.findMany({
      where: {
        OR: [
          { contestId: { in: RECOMMENDED_EXACT_CONTEST_IDS } },
          { contestId: { startsWith: 'joi' } },
        ],
      },
      select: {
        contestId: true,
        problemId: true,
        problemIndex: true,
        problem: {
          select: {
            name: true,
            difficulty: true,
          },
        },
      },
    }),
  ]);

  const firstAcceptedByProblem = buildFirstAcceptedByProblem(submissions);
  const curriculumSections = buildCurriculumSections(
    curriculumRows,
    firstAcceptedByProblem,
    ratingHistory
  );
  const bandSummaries = buildRatingBandSummaries(
    ratingHistory,
    submissions
  );

  return {
    summary: buildAnalyticsSummary(ratingHistory, submissions, bandSummaries),
    ratingFitness: buildRatingFitness(ratingHistory),
    bandSummaries,
    curriculumSections,
  };
}
