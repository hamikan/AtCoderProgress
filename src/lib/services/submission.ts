import { prisma } from '@/lib/prisma';
import { Submission } from '@/types/submission';

const API_ENDPOINT = 'https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions';
const FETCH_INTERVAL_MINUTES = 15;

interface RawSubmission {
  id: number;
  epoch_second: number;
  problem_id: string;
  contest_id: string;
  user_id: string;
  language: string;
  point: number;
  length: number;
  result: string;
  execution_time: number | null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getSubmissionsFromDB(userId: string, contestType: string): Promise<Submission[]> {
  return prisma.submission.findMany({
    where: {
      userId,
      ...(contestType ? { problemId: { startsWith: contestType } } : {})
    }
  })
}

export async function syncSubmissionsFromAPI(userId: string): Promise<{ addedCount: number; message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.atcoderId) {
    return { addedCount: 0, message: 'User not found or AtCoder ID is missing' };
  }
  
  const latestDbSubmission = await prisma.submission.findFirst({
    where: { userId: user.id, problemId: { startsWith: contestType } },
    orderBy: { epochSecond: 'desc' },
  });
  let fromSecond = latestDbSubmission ? latestDbSubmission.epochSecond + 1 : 0;

  const newSubmissions: Submission[] = [];
  const limit = 500;

  try {
    const atcoderId = user.atcoderId;
    while (true) {
      const url = `${API_ENDPOINT}?user=${atcoderId}&from_second=${fromSecond}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.text();
        return { addedCount: 0, message: `API Error: ${errorData}` };
      }
      
      const rawData: RawSubmission[] = await response.json();
      if (rawData.length === 0) break;
      
      const data: Submission[] = rawData.map((sub) => ({
        id: sub.id,
        epochSecond: sub.epoch_second,
        problemId: sub.problem_id,
        contestId: sub.contest_id,
        userId: user.id,
        language: sub.language,
        point: sub.point,
        length: sub.length,
        result: sub.result,
        executionTime: sub.execution_time,
      }));

      newSubmissions.push(...data);
      if (data.length < limit) break;

      fromSecond = data[data.length - 1].epochSecond + 1;
      await sleep(1500);
    }

    if (newSubmissions.length > 0) {
      const problemIdxToCheck = [...new Set(newSubmissions.map(sub => sub.problemId))];
      const existingProblems = await prisma.problem.findMany({
        where: { id: { in: problemIdxToCheck } },
        select: { id: true },
      });
      const existingProblemIds = new Set(existingProblems.map(sub => sub.id));
      const validSubmissions = newSubmissions.filter(sub => existingProblemIds.has(sub.problemId));

      if (validSubmissions.length > 0) {
        await prisma.submission.createMany({
          data: validSubmissions,
          skipDuplicates: true,
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { submissionsLastFetchedAt: new Date() },
      });

      return { addedCount: validSubmissions.length, message: 'Fetched from API and updated database.' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { submissionsLastFetchedAt: new Date() },
    });
    
    return { addedCount: 0, message: 'No new submissions.' };
  } catch (error) {
    console.error('Error syncing submission data:', error);
    return { addedCount: 0, message: `Error syncing submission data: ${error}` };
  }
}
