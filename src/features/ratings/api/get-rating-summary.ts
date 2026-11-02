import 'server-only';

import { startOfMonth } from 'date-fns';

import { prisma } from '@/lib/prisma';
import type { RatingSummary } from '@/features/ratings/types';

export async function getRatingSummary(userId?: string): Promise<RatingSummary> {
  if (!userId) {
    return {
      currentRating: 0,
      currentRatingChange: 0,
      highestRating: 0,
    };
  }

  const startOfCurrentMonth = startOfMonth(new Date());
  // Unrated participations do not change the rating, so they must not
  // feed the current/highest rating or the monthly change (issue #116).
  const history = await prisma.userRatingHistory.findMany({
    where: { userId, isRated: true },
    orderBy: { endTime: 'desc' },
    select: { endTime: true, newRating: true },
  });

  const currentRating = history[0]?.newRating ?? 0;
  const lastMonthRating =
    history.find((entry) => entry.endTime < startOfCurrentMonth)?.newRating ?? 0;

  return {
    currentRating,
    currentRatingChange: currentRating - lastMonthRating,
    highestRating: history.reduce(
      (highest, entry) => Math.max(highest, entry.newRating),
      0
    ),
  };
}
