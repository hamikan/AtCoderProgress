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
