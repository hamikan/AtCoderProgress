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
