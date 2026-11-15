import type {
  RatingHistoryPersistenceRecord,
  RatingHistoryWrites,
} from '@/features/ratings/types';

const COMPARED_FIELDS = [
  'isRated',
  'place',
  'oldRating',
  'newRating',
  'performance',
  'innerPerformance',
  'contestName',
  'contestNameEn',
] as const;

function hasChanged(
  stored: RatingHistoryPersistenceRecord,
  incoming: RatingHistoryPersistenceRecord
): boolean {
  return (
    stored.endTime.getTime() !== incoming.endTime.getTime() ||
    COMPARED_FIELDS.some((field) => stored[field] !== incoming[field])
  );
}

// AtCoder があとからレートを計算し直したり unrated に変えたりするので、保存済みの回も値が変わっていれば書き直す
export function selectRatingHistoryWrites(
  stored: readonly RatingHistoryPersistenceRecord[],
  incoming: readonly RatingHistoryPersistenceRecord[]
): RatingHistoryWrites {
  const storedByContest = new Map(stored.map((record) => [record.contestScreenName, record]));
  return {
    newRecords: incoming.filter((record) => !storedByContest.has(record.contestScreenName)),
    changedRecords: incoming.filter((record) => {
      const current = storedByContest.get(record.contestScreenName);
      return current !== undefined && hasChanged(current, record);
    }),
  };
}
