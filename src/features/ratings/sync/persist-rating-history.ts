import 'server-only';

import { prisma } from '@/lib/prisma';
import type { RatingHistoryResource } from '@/lib/atcoder/ratings/types';
import type {
    RatingHistorySyncTransaction,
    RatingHistoryWriterTransaction,
} from '@/features/ratings/types';

export async function persistRatingHistoryInTransaction(
    transaction: RatingHistoryWriterTransaction,
    atcoderAccountId: string,
    history: RatingHistoryResource[]
) {
    const data = history.map((item) => ({
        atcoderAccountId,
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

export async function persistRatingHistoryForAccount(
    transaction: RatingHistorySyncTransaction,
    atcoderAccountId: string,
    atcoderId: string,
    history: RatingHistoryResource[]
): Promise<void> {
    await transaction.atCoderAccount.upsert({
        where: { id: atcoderAccountId },
        create: { id: atcoderAccountId, name: atcoderId },
        update: {},
    });
    await persistRatingHistoryInTransaction(transaction, atcoderAccountId, history);
}

export async function persistRatingHistory(
    atcoderAccountId: string,
    atcoderId: string,
    history: RatingHistoryResource[]
): Promise<void> {
    await prisma.$transaction((transaction) =>
        persistRatingHistoryForAccount(transaction, atcoderAccountId, atcoderId, history)
    );
}
