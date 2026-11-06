import 'server-only';

import { prisma } from '@/lib/prisma';
import type { SubmissionResources } from '@/lib/atcoder/submissions/types';
import type {
  PersistSubmissionsResult,
  SubmissionSyncTransaction,
  SubmissionWriterTransaction,
} from '@/features/submissions/types';

export async function persistSubmissionsInTransaction(
  transaction: SubmissionWriterTransaction,
  atcoderAccountId: string,
  data: SubmissionResources
): Promise<PersistSubmissionsResult> {
  const { submissions } = data;
  const problemIds = [...new Set(submissions.map((submission) => submission.problem_id))];
  const existingProblems = await transaction.problem.findMany({
    where: { id: { in: problemIds } },
    select: { id: true },
  });
  const existingProblemIds = new Set(existingProblems.map((problem) => problem.id));

  const records = submissions
    .filter((submission) => existingProblemIds.has(submission.problem_id))
    .map((submission) => ({
      id: submission.id,
      epochSecond: submission.epoch_second,
      problemId: submission.problem_id,
      contestId: submission.contest_id,
      atcoderAccountId,
      language: submission.language,
      point: submission.point,
      length: submission.length,
      result: submission.result,
      executionTime: submission.execution_time,
    }));
  const droppedSubmissions = submissions.filter(
    (submission) => !existingProblemIds.has(submission.problem_id)
  );
  if (droppedSubmissions.length > 0) {
    const droppedProblemIds = [
      ...new Set(droppedSubmissions.map((submission) => submission.problem_id)),
    ];
    console.warn(
      `[submissions] ${atcoderAccountId}: skipped ${droppedSubmissions.length} submission(s) ` +
        `for problems not imported yet (${droppedProblemIds.slice(0, 5).join(', ')})`
    );
  }

  if (records.length === 0) {
    return { storedCount: 0, updatedCount: 0, droppedCount: droppedSubmissions.length };
  }

  const storedSubmissions = await transaction.submission.findMany({
    where: { id: { in: records.map((record) => record.id) } },
    select: { id: true, result: true, point: true, executionTime: true },
  });
  const storedById = new Map(
    storedSubmissions.map((submission) => [submission.id, submission])
  );

  const newRecords = records.filter((record) => !storedById.has(record.id));
  if (newRecords.length > 0) {
    await transaction.submission.createMany({
      data: newRecords,
      skipDuplicates: true,
    });
  }

  // 採点中（WJ）のときに保存した提出は、あとで結果が確定するので取り直した値で更新する
  const changedRecords = records.filter((record) => {
    const stored = storedById.get(record.id);
    return (
      stored !== undefined &&
      (stored.result !== record.result ||
        stored.point !== record.point ||
        stored.executionTime !== record.executionTime)
    );
  });
  for (const record of changedRecords) {
    await transaction.submission.update({
      where: { id: record.id },
      data: {
        result: record.result,
        point: record.point,
        executionTime: record.executionTime,
      },
    });
  }

  return {
    storedCount: newRecords.length,
    updatedCount: changedRecords.length,
    droppedCount: droppedSubmissions.length,
  };
}

// 入力された ID は大文字小文字がずれていることがあるので、提出に書かれた AtCoder 側の表記があればそちらを使う
export function getCanonicalAtCoderName(data: SubmissionResources): string | null {
  return data.submissions[0]?.user_id ?? null;
}

export async function persistSubmissionsForAccount(
  transaction: SubmissionSyncTransaction,
  atcoderAccountId: string,
  atcoderId: string,
  data: SubmissionResources,
  fetchedAt: Date
): Promise<void> {
  const canonicalName = getCanonicalAtCoderName(data);
  await transaction.atCoderAccount.upsert({
    where: { id: atcoderAccountId },
    create: {
      id: atcoderAccountId,
      name: canonicalName ?? atcoderId,
      submissionsLastFetchedAt: fetchedAt,
    },
    update: {
      ...(canonicalName ? { name: canonicalName } : {}),
      submissionsLastFetchedAt: fetchedAt,
    },
  });
  await persistSubmissionsInTransaction(transaction, atcoderAccountId, data);
}

export async function persistSubmissions(
  atcoderAccountId: string,
  atcoderId: string,
  data: SubmissionResources,
  fetchedAt: Date = new Date()
): Promise<void> {
  await prisma.$transaction((transaction) =>
    persistSubmissionsForAccount(
      transaction,
      atcoderAccountId,
      atcoderId,
      data,
      fetchedAt
    )
  );
}
