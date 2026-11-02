export interface PersistSubmissionsResult {
  /** Submissions stored for the first time. */
  storedCount: number;
  /** Stored submissions whose result/point/execution time changed. */
  updatedCount: number;
  /**
   * Submissions not stored because their problem is not in the
   * database yet (issue #110).
   */
  droppedCount: number;
}

export interface SubmissionPersistenceRecord {
  id: number;
  epochSecond: number;
  problemId: string;
  contestId: string;
  userId: string;
  language: string;
  point: number;
  length: number;
  result: string;
  executionTime: number | null;
}

export interface SubmissionWriterTransaction {
  problem: {
    findMany(args: {
      select: { id: true };
      where: { id: { in: string[] } };
    }): Promise<Array<{ id: string }>>;
  };
  submission: {
    createMany(args: {
      data: SubmissionPersistenceRecord[];
      skipDuplicates: true;
    }): Promise<unknown>;
    findMany(args: {
      select: { id: true; result: true; point: true; executionTime: true };
      where: { userId: string; id: { in: number[] } };
    }): Promise<
      Array<{
        id: number;
        result: string;
        point: number;
        executionTime: number | null;
      }>
    >;
    update(args: {
      data: { result: string; point: number; executionTime: number | null };
      where: { userId_id: { userId: string; id: number } };
    }): Promise<unknown>;
  };
}

export interface SubmissionSyncTransaction
  extends SubmissionWriterTransaction {
  user: {
    findUnique(args: {
      select: { atcoderId: true };
      where: { id: string };
    }): Promise<{ atcoderId: string | null } | null>;
    updateMany(args: {
      data: { submissionsLastFetchedAt: Date };
      where: { id: string; atcoderId: string };
    }): Promise<{ count: number }>;
  };
}
