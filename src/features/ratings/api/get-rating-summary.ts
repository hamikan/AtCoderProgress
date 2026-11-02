import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTokyoMonthStartEpochSecond } from '@/lib/date/tokyo-date';
import type { RatingSummary } from '@/features/ratings/types';

export async function getRatingSummary(userId?: string): Promise<RatingSummary> {
  if (!userId) {
    return {
      currentRating: 0,
      currentRatingChange: 0,
      highestRating: 0,
    };
  }

  // Month boundaries follow Asia/Tokyo, not the server timezone (#115).
  const startOfCurrentMonth = new Date(
    getTokyoMonthStartEpochSecond(new Date()) * 1000
  );
  const history = await prisma.userRatingHistory.findMany({
    where: { userId },
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
