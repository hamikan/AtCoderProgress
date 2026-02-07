import { prisma } from '@/lib/prisma';
import { SubmissionResources } from './type';

export async function persistSubmissionData(userId: string, data: SubmissionResources) {
  const { submissions } = data;
  await prisma.$transaction(async (tx) => {
    const problemIds = [...new Set(submissions.map((submission) => submission.problem_id))];
    const existingProblems = await tx.problem.findMany({
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
        userId: userId,
        language: submission.language,
        point: submission.point,
        length: submission.length,
        result: submission.result,
        executionTime: submission.execution_time,
      }));
    if (validSubmissions.length > 0) {
      await tx.submission.createMany({
        data: validSubmissions,
        skipDuplicates: true,
      });
    }
  });
}