import {
  formatTokyoDate,
  formatTokyoDateParts,
  getTokyoDateParts,
  getTokyoDateStartEpochSecond,
  shiftTokyoDateParts,
} from '@/lib/date/tokyo-date';
import type {
  AcceptedProblemHeatmapDay,
  AcceptedSubmissionRow,
} from '@/features/submissions/types';

const HEATMAP_DAYS = 365;

export function getAcceptedProblemHeatmapStartEpoch(now: Date): number {
  const startParts = shiftTokyoDateParts(
    getTokyoDateParts(now),
    -HEATMAP_DAYS
  );
  return getTokyoDateStartEpochSecond(startParts);
}

export function buildAcceptedProblemHeatmap(
  submissions: readonly AcceptedSubmissionRow[],
  now: Date
): AcceptedProblemHeatmapDay[] {
  const problemIdsByDate = new Map<string, Set<string>>();

  for (const submission of submissions) {
    const date = formatTokyoDate(new Date(submission.epochSecond * 1000));
    const problemIds = problemIdsByDate.get(date) ?? new Set<string>();
    problemIds.add(submission.problemId);
    problemIdsByDate.set(date, problemIds);
  }

  const endParts = getTokyoDateParts(now);

  return Array.from({ length: HEATMAP_DAYS + 1 }, (_, index) => {
    const date = formatTokyoDateParts(
      shiftTokyoDateParts(endParts, -(HEATMAP_DAYS - index))
    );
    const count = problemIdsByDate.get(date)?.size ?? 0;

    return { count, date, level: getHeatmapLevel(count) };
  });
}

function getHeatmapLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}
