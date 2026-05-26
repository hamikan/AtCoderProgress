import { prisma } from '@/lib/prisma';
import type { SubmissionStatus } from '@/types/submission';

export interface SubmissionSummaryRow {
  problemId: string;
  result: string;
  epochSecond: number;
}

interface SubmissionSummary {
  statusMap: Record<string, SubmissionStatus>;
  acCount: number;
  tryingCount: number;
}

export function buildSubmissionSummary(rows: SubmissionSummaryRow[]): SubmissionSummary {
  const statusMap: Record<string, SubmissionStatus> = {};
  let acCount = 0;
  let tryingCount = 0;

  for (const row of rows) {
    const existing = statusMap[row.problemId];
    if (existing) {
      if (row.result === 'AC') {
        if (existing.result !== 'AC') {
          acCount++;
          tryingCount--;
          statusMap[row.problemId] = { result: 'AC', epochSecond: row.epochSecond };
        } else {
          statusMap[row.problemId] = {
            result: 'AC',
            epochSecond: Math.min(existing.epochSecond, row.epochSecond),
          };
        }
      }
      continue;
    }

    if (row.result === 'AC') {
      acCount++;
    } else {
      tryingCount++;
    }
    statusMap[row.problemId] = { result: row.result, epochSecond: row.epochSecond };
  }

  return { statusMap, acCount, tryingCount };
}

export async function getSubmissionsFromDB(userId: string, contestType: string): Promise<SubmissionSummaryRow[]> {
  return prisma.submission.findMany({
    where: {
      userId,
      ...(contestType ? { problemId: { startsWith: contestType } } : {})
    },
    select: {
      problemId: true,
      result: true,
      epochSecond: true,
    },
  })
}

export async function getSubmissionsByProblemIdsFromDB(
  userId: string,
  problemIds: string[]
): Promise<SubmissionSummaryRow[]> {
  if (problemIds.length === 0) return [];

  return prisma.submission.findMany({
    where: {
      userId,
      problemId: { in: problemIds },
    },
    select: {
      problemId: true,
      result: true,
      epochSecond: true,
    },
  });
}

export async function getSubmissionSummary(userId: string, contestType: string) {
  const submissions = await getSubmissionsFromDB(userId, contestType);
  return buildSubmissionSummary(submissions);
}

export async function getSubmissionSummaryByProblemIds(userId: string, problemIds: string[]) {
  const submissions = await getSubmissionsByProblemIdsFromDB(userId, problemIds);
  return buildSubmissionSummary(submissions);
}
