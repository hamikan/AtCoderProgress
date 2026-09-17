import 'server-only';

import {
  buildAcceptedProblemHeatmap,
  getAcceptedProblemHeatmapStartEpoch,
} from '@/features/submissions/functions/build-accepted-problem-heatmap';
import type { AcceptedProblemHeatmapDay } from '@/features/submissions/types';
import { prisma } from '@/lib/prisma';

export async function getAcceptedProblemHeatmap(
  userId?: string
): Promise<AcceptedProblemHeatmapDay[]> {
  const now = new Date();
  const acceptedSubmissions = userId
    ? await prisma.submission.findMany({
        where: {
          epochSecond: { gte: getAcceptedProblemHeatmapStartEpoch(now) },
          result: 'AC',
          userId,
        },
        select: {
          epochSecond: true,
          problemId: true,
        },
      })
    : [];

  return buildAcceptedProblemHeatmap(acceptedSubmissions, now);
}
