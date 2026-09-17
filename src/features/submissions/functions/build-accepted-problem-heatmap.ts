import { format, subDays } from 'date-fns';

import type {
  AcceptedProblemHeatmapDay,
  AcceptedSubmissionRow,
} from '@/features/submissions/types';

const HEATMAP_DAYS = 365;

export function getAcceptedProblemHeatmapStartEpoch(now: Date): number {
  return Math.floor(subDays(now, HEATMAP_DAYS).getTime() / 1000);
}

export function buildAcceptedProblemHeatmap(
  submissions: readonly AcceptedSubmissionRow[],
  now: Date
): AcceptedProblemHeatmapDay[] {
  const problemIdsByDate = new Map<string, Set<string>>();

  for (const submission of submissions) {
    const date = format(
      new Date(submission.epochSecond * 1000),
      'yyyy-MM-dd'
    );
    const problemIds = problemIdsByDate.get(date) ?? new Set<string>();
    problemIds.add(submission.problemId);
    problemIdsByDate.set(date, problemIds);
  }

  return Array.from({ length: HEATMAP_DAYS + 1 }, (_, index) => {
    const date = format(
      subDays(now, HEATMAP_DAYS - index),
      'yyyy-MM-dd'
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
