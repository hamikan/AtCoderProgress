import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isCurrentAtCoderId } from '@/lib/services/sync/atcoder-id-guard';
import { SubmissionResources } from './type';

export interface SubmissionPersistenceTransaction {
  problem: {
    findMany(args: {
      select: { id: true };
      where: { id: { in: string[] } };
    }): Promise<Array<{ id: string }>>;
  };
  submission: {
    createMany(args: {
      data: Prisma.SubmissionCreateManyInput[];
      skipDuplicates: true;
    }): Promise<unknown>;
  };
}

export async function persistSubmissionDataInTransaction(
  transaction: SubmissionPersistenceTransaction,
  userId: string,
  data: SubmissionResources
) {
  const { submissions } = data;
  const problemIds = [...new Set(submissions.map((submission) => submission.problem_id))];
  const existingProblems = await transaction.problem.findMany({
    where: { id: { in: problemIds } },
    select: { id: true },
  });
  const existingProblemIds = new Set(existingProblems.map((problem) => problem.id));

  const validSubmissions = submissions
    .filter((submission) => existingProblemIds.has(submission.problem_id))
    .map((submission) => ({
      id: submission.id,
      epochSecond: submission.epoch_second,
      problemId: submission.problem_id,
      contestId: submission.contest_id,
      userId: userId,
      language: submission.language,
      point: submission.point,
      length: submission.length,
      result: submission.result,
      executionTime: submission.execution_time,
    }));
  if (validSubmissions.length > 0) {
    await transaction.submission.createMany({
      data: validSubmissions,
      skipDuplicates: true,
    });
  }
}

export async function persistSubmissionData(
  userId: string,
  atcoderId: string,
  data: SubmissionResources
) {
  const { submissions } = data;
  return prisma.$transaction(async (tx) => {
    if (!await isCurrentAtCoderId(tx, userId, atcoderId)) {
      return false;
    }

    await persistSubmissionDataInTransaction(tx, userId, { submissions });
    return true;
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}
