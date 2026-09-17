import type {
  SubmissionStatus,
  SubmissionSummary,
  SubmissionSummaryRow,
} from '@/features/submissions/types';

export function buildSubmissionSummary(
  rows: SubmissionSummaryRow[]
): SubmissionSummary {
  const statusMap: Record<string, SubmissionStatus> = {};
  let acCount = 0;
  let tryingCount = 0;

  for (const row of rows) {
    const existing = statusMap[row.problemId];
    if (existing) {
      if (row.result === 'AC') {
        if (existing.result !== 'AC') {
          acCount += 1;
          tryingCount -= 1;
          statusMap[row.problemId] = {
            result: 'AC',
            epochSecond: row.epochSecond,
          };
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
      acCount += 1;
    } else {
      tryingCount += 1;
    }
    statusMap[row.problemId] = {
      result: row.result,
      epochSecond: row.epochSecond,
    };
  }

  return { statusMap, acCount, tryingCount };
}
