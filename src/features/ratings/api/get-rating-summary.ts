import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTokyoMonthStartEpochSecond } from '@/lib/date/tokyo-date';
import type { RatingSummary } from '@/features/ratings/types';

export async function getRatingSummary(
  atcoderAccountId?: string | null
): Promise<RatingSummary> {
  if (!atcoderAccountId) {
    return {
      currentRating: 0,
      currentRatingChange: 0,
      highestRating: 0,
      lastMonthRating: null,
    };
  }

  const startOfCurrentMonth = new Date(
    getTokyoMonthStartEpochSecond(new Date()) * 1000
  );
  const history = await prisma.userRatingHistory.findMany({
    where: { atcoderAccountId, isRated: true },
    orderBy: { endTime: 'desc' },
    select: { endTime: true, newRating: true },
  });

  const currentRating = history[0]?.newRating ?? 0;
  const lastMonthRating =
    history.find((entry) => entry.endTime < startOfCurrentMonth)?.newRating ?? null;

  return {
    currentRating,
    currentRatingChange: currentRating - (lastMonthRating ?? 0),
    highestRating: history.reduce(
      (highest, entry) => Math.max(highest, entry.newRating),
      0
    ),
    lastMonthRating,
  };
}
