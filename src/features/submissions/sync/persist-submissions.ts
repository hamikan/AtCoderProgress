import 'server-only';

import { prisma } from '@/lib/prisma';
import type { SubmissionResources } from '@/lib/atcoder/submissions/types';
import type {
  PersistSubmissionsResult,
  SubmissionPersistenceRecord,
  SubmissionSyncTransaction,
  SubmissionWriterTransaction,
} from '@/features/submissions/types';

async function findExistingProblemIds(
  transaction: SubmissionWriterTransaction,
  problemIds: string[]
): Promise<Set<string>> {
  if (problemIds.length === 0) {
    return new Set();
  }
  const problems = await transaction.problem.findMany({
    where: { id: { in: problemIds } },
    select: { id: true },
  });
  return new Set(problems.map((problem) => problem.id));
}

export async function promotePendingSubmissions(
  transaction: SubmissionWriterTransaction,
  where: { atcoderAccountId?: string } = {}
): Promise<number> {
  const pendingRows = await transaction.pendingSubmission.findMany({ where });
  const existingProblemIds = await findExistingProblemIds(transaction, [
    ...new Set(pendingRows.map((row) => row.problemId)),
  ]);
  const readyRows = pendingRows.filter((row) => existingProblemIds.has(row.problemId));
  if (readyRows.length === 0) {
    return 0;
  }
  await transaction.submission.createMany({ data: readyRows, skipDuplicates: true });
  await transaction.pendingSubmission.deleteMany({
    where: { id: { in: readyRows.map((row) => row.id) } },
  });
  return readyRows.length;
}

export async function promoteAllPendingSubmissions(): Promise<number> {
  return prisma.$transaction((transaction) => promotePendingSubmissions(transaction));
}

async function keepPendingSubmissions(
  transaction: SubmissionWriterTransaction,
  atcoderAccountId: string,
  records: SubmissionPersistenceRecord[]
): Promise<void> {
  if (records.length === 0) {
    return;
  }
  // 採点中に取っておいた提出もあとで結果が変わるので、取り直した値で置き換える
  await transaction.pendingSubmission.deleteMany({
    where: { id: { in: records.map((record) => record.id) } },
  });
  await transaction.pendingSubmission.createMany({ data: records, skipDuplicates: true });
  const problemIds = [...new Set(records.map((record) => record.problemId))];
  console.warn(
    `[submissions] ${atcoderAccountId}: kept ${records.length} submission(s) ` +
      `until their problems are imported (${problemIds.slice(0, 5).join(', ')})`
  );
}

export async function persistSubmissionsInTransaction(
  transaction: SubmissionWriterTransaction,
  atcoderAccountId: string,
  data: SubmissionResources
): Promise<PersistSubmissionsResult> {
  // 前に取っておいた提出のうち、問題データが入ったものを先に移しておく
  const promotedCount = await promotePendingSubmissions(transaction, { atcoderAccountId });

  const allRecords: SubmissionPersistenceRecord[] = data.submissions.map((submission) => ({
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
  const existingProblemIds = await findExistingProblemIds(transaction, [
    ...new Set(allRecords.map((record) => record.problemId)),
  ]);
  const records = allRecords.filter((record) => existingProblemIds.has(record.problemId));
  const pendingRecords = allRecords.filter((record) => !existingProblemIds.has(record.problemId));
  await keepPendingSubmissions(transaction, atcoderAccountId, pendingRecords);

  if (records.length === 0) {
    return { storedCount: 0, updatedCount: 0, pendingCount: pendingRecords.length, promotedCount };
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
    pendingCount: pendingRecords.length,
    promotedCount,
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
