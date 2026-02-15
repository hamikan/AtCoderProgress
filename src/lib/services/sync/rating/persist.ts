import { prisma } from '@/lib/prisma';
import type { RatingHistoryResource } from './types';

export async function persistRatingHistory(userId: string, history: RatingHistoryResource[]) {
    if (history.length === 0) return;

    const data = history.map((item) => ({
        userId,
        isRated: item.IsRated,
        place: item.Place,
        oldRating: item.OldRating,
        newRating: item.NewRating,
        performance: item.Performance,
        innerPerformance: item.InnerPerformance,
        contestScreenName: item.ContestScreenName,
        contestName: item.ContestName,
        contestNameEn: item.ContestNameEn,
        endTime: new Date(item.EndTime),
    }));

    await prisma.userRatingHistory.createMany({
        data,
        skipDuplicates: true,
    });
}
