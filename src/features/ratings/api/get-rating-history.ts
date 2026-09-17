import 'server-only';

import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import type { RatingData } from '@/features/ratings/types';

export async function getRatingHistory(userId?: string): Promise<RatingData[]> {
    if (!userId) {
        return [];
    }

    const history = await prisma.userRatingHistory.findMany({
        where: { userId },
        orderBy: { endTime: 'asc' },
        select: {
            endTime: true,
            newRating: true,
            contestName: true,
        },
    });

    return history.map((h) => ({
        date: format(h.endTime, 'yyyy-MM-dd'),
        rating: h.newRating,
        contestName: h.contestName,
    }));
}
