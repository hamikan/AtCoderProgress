export interface RatingHistoryPersistenceRecord {
  userId: string;
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
  extends RatingHistoryWriterTransaction {
  user: {
    findUnique(args: {
      select: { atcoderId: true };
      where: { id: string };
    }): Promise<{ atcoderId: string | null } | null>;
  };
}
