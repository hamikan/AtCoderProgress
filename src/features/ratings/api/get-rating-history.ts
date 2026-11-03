import 'server-only';

import { prisma } from '@/lib/prisma';
import type { RatingData } from '@/features/ratings/types';

export async function getRatingHistory(userId?: string): Promise<RatingData[]> {
    if (!userId) {
        return [];
    }

    const history = await prisma.userRatingHistory.findMany({
        where: { userId, isRated: true },
        orderBy: { endTime: 'asc' },
        select: {
            endTime: true,
            newRating: true,
            contestName: true,
            performance: true,
        },
    });

    return history.map((h) => ({
        endedAt: h.endTime.getTime(),
        rating: h.newRating,
        contestName: h.contestName,
        performance: h.performance,
    }));
}
