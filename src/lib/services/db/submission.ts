import { prisma } from '@/lib/prisma';
import { SubmissionStatus } from '@/types/submission';

interface SubmissionSummaryRow {
  problemId: string;
  result: string;
  epochSecond: number;
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

export async function getSubmissionSummary(userId: string, contestType: string) {
  const submissions = await getSubmissionsFromDB(userId, contestType);
  
  const statusMap: Record<string, SubmissionStatus> = {};
  let acCount = 0;
  let tryingCount = 0;

  for (const sub of submissions) {
    const existing = statusMap[sub.problemId];
    if (existing) {
      if (sub.result === 'AC') {
        if (existing.result !== 'AC') {
          acCount++;
          tryingCount--;
          statusMap[sub.problemId] = { result: 'AC', epochSecond: sub.epochSecond };
        } else {
          statusMap[sub.problemId] = { 
            result: 'AC', 
            epochSecond: Math.min(existing.epochSecond!, sub.epochSecond) 
          };
        }
      }
    } else {
      if (sub.result === 'AC') {
        acCount++;
      } else {
        tryingCount++;
      }
      statusMap[sub.problemId] = { result: sub.result, epochSecond: sub.epochSecond };
    }
  }

  return { statusMap, acCount, tryingCount };
}
