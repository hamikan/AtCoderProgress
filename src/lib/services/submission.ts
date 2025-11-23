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

export default async function fetchSubmission(userId: string, contestType: string): Promise<{ submissions: Submission[], message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.atcoderId) {
    return { submissions: [], message: 'User not found or AtCoder ID is missing' };
  }

  const now = new Date();
  if (user.submissionsLastFetchedAt) {
    const diffMilliseconds = now.getTime() - user.submissionsLastFetchedAt.getTime();
    if (diffMilliseconds < FETCH_INTERVAL_MINUTES * 60 * 1000) {
      // 前回の取得から指定時間内であれば、DBからデータを返す
      const submissions = await prisma.submission.findMany({
        where: { userId: user.id, problemId: { startsWith: contestType } },
      });
      return { submissions, message: 'Fetched from database (cache).' };
    }
  }

  // 1. DBから最新の提出を取得し、次の取得開始時刻を決める
  const latestDbSubmission = await prisma.submission.findFirst({
    where: { userId: user.id, problemId: { startsWith: contestType } },
    orderBy: { epochSecond: 'desc' },
  });
  let fromSecond: number = latestDbSubmission ? latestDbSubmission.epochSecond + 1 : 0;

  // 2. 差分データを外部APIから取得
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const newSubmissions: Submission[] = [];
  const limit: number = 500; // APIの1回あたりの取得上限

  try {
    // /* 作業中に無駄にAPIを叩かないようにするため一旦コメントアウト
    const atcoderId: string = user.atcoderId;
    while (true) {
      const url = `${API_ENDPOINT}?user=${atcoderId}&from_second=${fromSecond}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error: ${errorData}`);
        return { submissions: [], message: `API Error: ${errorData}` };
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

    // 3. 新しく取得したデータをDBに保存
    if (newSubmissions.length > 0) {
      const problemIdxToCheck = [...new Set(newSubmissions.map(sub => sub.problemId))];
      const existingSubmissions = await prisma.problem.findMany({
        where: { id: { in: problemIdxToCheck, startsWith: contestType } },
        select: { id: true },
      });
      const existingProblemIds = new Set(existingSubmissions.map(sub => sub.id));
      const validSubmissions = newSubmissions.filter(sub => existingProblemIds.has(sub.problemId));

      if (validSubmissions.length > 0) {
        await prisma.submission.createMany({
          data: validSubmissions,
          skipDuplicates: true,
        });
      }
    }
    // */

    // 4. Userテーブルの`submissionsLastFetchedAt`を更新
    await prisma.user.update({
      where: { id: user.id },
      data: { submissionsLastFetchedAt: now },
    });

    // 5. DBの既存データと新しいデータを結合して返却
    const allDbSubmissions = await prisma.submission.findMany({
      where: { userId: user.id, problemId: { startsWith: contestType } },
    });

    return { submissions: allDbSubmissions, message: 'Fetched from API and updated database.' };

  } catch (error) {
    console.error('Error syncing submission data:', error);
    return { submissions: [], message: `Error syncing submission data: ${error}` };
  }
}
