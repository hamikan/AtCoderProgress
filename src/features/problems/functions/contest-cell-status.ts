import type { ContestCellStatus } from '@/features/problems/types';
import type { SubmissionStatus } from '@/features/submissions/types';

export const CONTEST_CELL_STATUS_STYLES: Record<
  ContestCellStatus,
  { backgroundClass: string; label: string }
> = {
  'ac-in-contest': { backgroundClass: 'bg-green-200', label: 'コンテスト中にAC' },
  'ac-after-contest': { backgroundClass: 'bg-green-100', label: 'コンテスト後にAC' },
  tried: { backgroundClass: 'bg-yellow-100', label: '提出あり（ACなし）' },
};

export function getContestCellStatus(
  submission: SubmissionStatus | undefined,
  startEpochSecond: number,
  durationSecond: number
): ContestCellStatus | null {
  if (!submission?.result || submission.epochSecond === undefined) return null;
  if (submission.result !== 'AC') return 'tried';

  const start = BigInt(startEpochSecond);
  const submittedAt = BigInt(submission.epochSecond);
  return start <= submittedAt && submittedAt < start + BigInt(durationSecond)
    ? 'ac-in-contest'
    : 'ac-after-contest';
}
