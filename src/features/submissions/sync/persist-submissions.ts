import 'server-only';

import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { SubmissionResources } from '@/lib/atcoder/submissions/types';
import type {
  PersistSubmissionsResult,
  SubmissionSyncTransaction,
  SubmissionWriterTransaction,
} from '@/features/submissions/types';

export async function persistSubmissionsInTransaction(
  transaction: SubmissionWriterTransaction,
  userId: string,
  data: SubmissionResources
): Promise<PersistSubmissionsResult> {
  const { submissions } = data;
  const uniqueSubmissions = [
    ...new Map(submissions.map((submission) => [submission.id, submission])).values(),
  ];
  const problemIds = [...new Set(uniqueSubmissions.map((submission) => submission.problem_id))];
  const existingProblems = await transaction.problem.findMany({
    where: { id: { in: problemIds } },
    select: { id: true },
  });
  const existingProblemIds = new Set(existingProblems.map((problem) => problem.id));

  const validSubmissions = uniqueSubmissions
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

  const droppedSubmissions = uniqueSubmissions.filter(
    (submission) => !existingProblemIds.has(submission.problem_id)
  );
  if (droppedSubmissions.length > 0) {
    // These submissions belong to problems the app has not imported
    // yet. Do not lose them silently: the caller keeps the fetch
    // timestamp back so a later sync retries them (issue #110).
    console.warn(
      `[submissions] dropped ${droppedSubmissions.length} submission(s) ` +
        `for user ${userId}: problems not imported yet (${[
          ...new Set(droppedSubmissions.map((s) => s.problem_id)),
        ]
          .slice(0, 5)
          .join(', ')})`
    );
  }

  if (validSubmissions.length === 0) {
    return {
      storedCount: 0,
      updatedCount: 0,
      droppedCount: droppedSubmissions.length,
    };
  }

  // Submissions are keyed per user (issue #114): another account may
  // hold a row with the same AtCoder submission ID, which must not
  // count as this user's stored submission.
  const existingSubmissions = await transaction.submission.findMany({
    where: {
      userId,
      id: { in: validSubmissions.map((submission) => submission.id) },
    },
    select: { id: true, result: true, point: true, executionTime: true },
  });
  const existingById = new Map(
    existingSubmissions.map((submission) => [submission.id, submission])
  );

  const newSubmissions = validSubmissions.filter(
    (submission) => !existingById.has(submission.id)
  );
  if (newSubmissions.length > 0) {
    await transaction.submission.createMany({
      data: newSubmissions,
      skipDuplicates: true,
    });
  }

  // Stored submissions were never updated before, so a submission
  // saved while judging (WJ) kept that result forever (issue #111).
  let updatedCount = 0;
  for (const submission of validSubmissions) {
    const existing = existingById.get(submission.id);
    if (
      existing &&
      (existing.result !== submission.result ||
        existing.point !== submission.point ||
        existing.executionTime !== submission.executionTime)
    ) {
      await transaction.submission.update({
        where: { userId_id: { userId, id: submission.id } },
        data: {
          result: submission.result,
          point: submission.point,
          executionTime: submission.executionTime,
        },
      });
      updatedCount += 1;
    }
  }

  return {
    storedCount: newSubmissions.length,
    updatedCount,
    droppedCount: droppedSubmissions.length,
  };
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

  const result = await persistSubmissionsInTransaction(transaction, userId, data);
  if (result.droppedCount > 0) {
    // Some submissions could not be stored because their problems are
    // not imported yet. Keep the previous fetch timestamp so the next
    // sync fetches the same range again instead of treating those
    // submissions as done (issue #110).
    return true;
  }

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
