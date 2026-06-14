'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { SolutionStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import {
  getProblemDetail,
  getSolutionsByProblemAndContest,
  saveSolutionRecord,
  type ProblemDetail,
  type SolutionRecordListItem,
} from '@/lib/services/db/solution';
import {
  normalizeContestId,
  normalizeProblemId,
} from '@/lib/validation/solution-input';

export async function getProblemDetailAction(problemId: string): Promise<ProblemDetail | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return await getProblemDetail(normalizeProblemId(problemId));
}

export async function saveSolution(
  solutionId: string | null,
  problemId: string,
  contestId: string,
  title: string | null,
  content: string,
  status: SolutionStatus,
  tagNames: string[]
): Promise<{ success: boolean; solutionId: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const savedSolutionId = await saveSolutionRecord(session.user.id, {
    solutionId,
    problemId,
    contestId,
    title,
    content,
    status,
    tagNames,
  });

  revalidatePath('/solutions');
  revalidatePath(`/solutions/${savedSolutionId}`);

  return { success: true, solutionId: savedSolutionId };
}

export async function getSolutionRecordsAction(
  problemId: string,
  contestId: string
): Promise<SolutionRecordListItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return await getSolutionsByProblemAndContest(
    session.user.id,
    normalizeProblemId(problemId),
    normalizeContestId(contestId)
  );
}
