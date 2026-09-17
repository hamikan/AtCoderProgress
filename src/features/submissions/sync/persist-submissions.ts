import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { SubmissionResources } from '@/lib/atcoder/submissions/types';
import type {
  SubmissionSyncTransaction,
  SubmissionWriterTransaction,
} from '@/features/submissions/types';

export async function persistSubmissionsInTransaction(
  transaction: SubmissionWriterTransaction,
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

export async function persistSubmissions(
  userId: string,
  atcoderId: string,
  data: SubmissionResources,
  fetchedAt: Date = new Date()
) {
  const { submissions } = data;
  return prisma.$transaction(async (tx) => {
    return persistSubmissionsForCurrentAtCoderId(
      tx,
      userId,
      atcoderId,
      { submissions },
      fetchedAt
    );
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

export async function persistSubmissionsForCurrentAtCoderId(
  transaction: SubmissionSyncTransaction,
  userId: string,
  atcoderId: string,
  data: SubmissionResources,
  fetchedAt: Date
): Promise<boolean> {
  if (!await hasCurrentAtCoderId(transaction, userId, atcoderId)) {
    return false;
  }

  await persistSubmissionsInTransaction(transaction, userId, data);
  const update = await transaction.user.updateMany({
    where: { id: userId, atcoderId },
    data: { submissionsLastFetchedAt: fetchedAt },
  });
  return update.count === 1;
}

async function hasCurrentAtCoderId(
  transaction: Pick<SubmissionSyncTransaction, 'user'>,
  userId: string,
  expectedAtCoderId: string
): Promise<boolean> {
  const user = await transaction.user.findUnique({
    where: { id: userId },
    select: { atcoderId: true },
  });
  return user?.atcoderId === expectedAtCoderId;
}
