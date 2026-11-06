import type { AtCoderAccountUpsertTransaction } from '@/features/submissions/types';

export interface RatingHistoryPersistenceRecord {
  atcoderAccountId: string;
  isRated: boolean;
  place: number;
  oldRating: number;
  newRating: number;
  performance: number;
  innerPerformance: number;
  contestScreenName: string;
  contestName: string;
  contestNameEn: string;
  endTime: Date;
}

export interface RatingHistoryWriterTransaction {
  userRatingHistory: {
    createMany(args: {
      data: RatingHistoryPersistenceRecord[];
      skipDuplicates: true;
    }): Promise<unknown>;
  };
}

export interface RatingHistorySyncTransaction
  extends RatingHistoryWriterTransaction,
    AtCoderAccountUpsertTransaction {}
