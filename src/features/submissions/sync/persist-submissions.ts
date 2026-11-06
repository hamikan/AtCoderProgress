import 'server-only';

import { prisma } from '@/lib/prisma';
import type { SubmissionResources } from '@/lib/atcoder/submissions/types';
import type {
  SubmissionSyncTransaction,
  SubmissionWriterTransaction,
} from '@/features/submissions/types';

export async function persistSubmissionsInTransaction(
  transaction: SubmissionWriterTransaction,
  atcoderAccountId: string,
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
      atcoderAccountId,
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
