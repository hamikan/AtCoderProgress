import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export interface RatingData {
    date: string;
    rating: number;
    contestName: string;
}

export async function getRatingHistoryData(userId: string): Promise<RatingData[]> {
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
