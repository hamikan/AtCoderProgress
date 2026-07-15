import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isCurrentAtCoderId } from '@/lib/services/sync/atcoder-id-guard';
import type { RatingHistoryResource } from './types';

export interface RatingHistoryPersistenceTransaction {
    userRatingHistory: {
        createMany(args: {
            data: Prisma.UserRatingHistoryCreateManyInput[];
            skipDuplicates: true;
        }): Promise<unknown>;
    };
}

export async function persistRatingHistoryInTransaction(
    transaction: RatingHistoryPersistenceTransaction,
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
        if (!await isCurrentAtCoderId(transaction, userId, atcoderId)) {
            return false;
        }

        await persistRatingHistoryInTransaction(transaction, userId, history);

        return true;
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
}
