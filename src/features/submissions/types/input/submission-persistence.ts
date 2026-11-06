export interface PersistSubmissionsResult {
  storedCount: number;
  updatedCount: number;
  droppedCount: number;
}

export interface SubmissionPersistenceRecord {
  id: number;
  epochSecond: number;
  problemId: string;
  contestId: string;
  atcoderAccountId: string;
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
      where: { id: { in: number[] } };
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
      where: { id: number };
    }): Promise<unknown>;
  };
}

export interface AtCoderAccountUpsertTransaction {
  atCoderAccount: {
    upsert(args: {
      create: {
        id: string;
        name: string;
        submissionsLastFetchedAt?: Date | null;
      };
      update: { name?: string; submissionsLastFetchedAt?: Date };
      where: { id: string };
    }): Promise<unknown>;
  };
}

export interface SubmissionSyncTransaction
  extends SubmissionWriterTransaction,
    AtCoderAccountUpsertTransaction {}
