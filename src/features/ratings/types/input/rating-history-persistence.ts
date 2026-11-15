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

export type RatingHistoryPersistenceValues = Omit<
  RatingHistoryPersistenceRecord,
  'atcoderAccountId' | 'contestScreenName'
>;

export interface RatingHistoryWrites {
  newRecords: RatingHistoryPersistenceRecord[];
  changedRecords: RatingHistoryPersistenceRecord[];
}

export interface RatingHistoryWriterTransaction {
  userRatingHistory: {
    createMany(args: {
      data: RatingHistoryPersistenceRecord[];
      skipDuplicates: true;
    }): Promise<unknown>;
    findMany(args: {
      where: { atcoderAccountId: string };
    }): Promise<RatingHistoryPersistenceRecord[]>;
    update(args: {
      data: RatingHistoryPersistenceValues;
      where: {
        atcoderAccountId_contestScreenName: {
          atcoderAccountId: string;
          contestScreenName: string;
        };
      };
    }): Promise<unknown>;
  };
}

export interface RatingHistorySyncTransaction
  extends RatingHistoryWriterTransaction,
    AtCoderAccountUpsertTransaction {}
