import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { RatingHistoryResource } from '@/lib/atcoder/ratings/types';
import type {
    RatingHistorySyncTransaction,
    RatingHistoryWriterTransaction,
} from '@/features/ratings/types';

export async function persistRatingHistoryInTransaction(
    transaction: RatingHistoryWriterTransaction,
    userId: string,
    history: RatingHistoryResource[]
) {
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

    if (data.length > 0) {
        await transaction.userRatingHistory.createMany({
            data,
            skipDuplicates: true,
        });
    }
}

export async function persistRatingHistory(
    userId: string,
    atcoderId: string,
    history: RatingHistoryResource[]
) {
    return prisma.$transaction(async (transaction) => {
        if (!await hasCurrentAtCoderId(transaction, userId, atcoderId)) {
            return false;
        }

        await persistRatingHistoryInTransaction(transaction, userId, history);

        return true;
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
}

async function hasCurrentAtCoderId(
    transaction: Pick<RatingHistorySyncTransaction, 'user'>,
    userId: string,
    expectedAtCoderId: string
): Promise<boolean> {
    const user = await transaction.user.findUnique({
        where: { id: userId },
        select: { atcoderId: true },
    });
    return user?.atcoderId === expectedAtCoderId;
}
