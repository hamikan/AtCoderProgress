import 'server-only';

import type { RecentSubmission } from '@/features/submissions/types';
import { prisma } from '@/lib/prisma';

export async function getRecentSubmissions(userId?: string): Promise<RecentSubmission[]> {
  if (!userId) {
    return [];
  }

  const submissions = await prisma.submission.findMany({
    where: { userId },
    take: 10,
    orderBy: { epochSecond: 'desc' },
    include: {
      problem: true,
    },
  });

  return submissions.map((submission) => ({
    id: submission.id,
    epochSecond: submission.epochSecond,
    problemId: submission.problemId,
    contestId: submission.contestId,
    title: submission.problem.name,
    result: submission.result,
    difficulty: submission.problem.difficulty,
  }));
}
