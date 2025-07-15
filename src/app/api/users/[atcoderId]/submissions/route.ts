import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Submission } from '@/types/submission';

const API_ENDPOINT = 'https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions';

export async function GET(request: NextRequest, { params }: { params: { atcoderId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { atcoderId } = await params;
  if (!atcoderId) {
    return NextResponse.json({ error: 'AtCoder ID is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { atcoderId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // 1. DBから最新の提出を取得し、次の取得開始時刻を決める
  const latestDbSubmission = await prisma.submission.findFirst({
    where: { userId: user.id },
    orderBy: { epochSecond: 'desc' },
  });
  let fromSecond = latestDbSubmission ? latestDbSubmission.epochSecond + 1 : 0;

  // 2. 差分データを外部APIから取得
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const newSubmissions: Submission[] = [];
  const limit = 500; // APIの1回あたりの取得上限

  try {
    /* 作業中に無駄にAPIを叩かないようにするため一旦コメントアウト
    while (true) {
      const url = `${API_ENDPOINT}?user=${atcoderId}&from_second=${fromSecond}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.text();
        return NextResponse.json({ error: `API Error: ${errorData}` }, { status: response.status });
      }

      const data: Submission[] = await response.json();
      if (data.length === 0) break;

      newSubmissions.push(...data);
      if (data.length < limit) break;

      fromSecond = data[data.length - 1].epoch_second + 1;
      await sleep(1500);
    }

    // 3. 新しく取得したデータをDBに保存
    if (newSubmissions.length > 0) {
      const submissionsToCreate = newSubmissions.map(sub => {
        const { user_id, ...rest } = sub; // APIの`user_id`をここで除外
        return {
          ...rest, // 残りのデータを展開
          userId: user.id, // DB用の`userId`を紐付ける
        }
      });
      await prisma.submission.createMany({
        data: submissionsToCreate,
        skipDuplicates: true,
      });
    }
    */

    // 4. DBの既存データと新しいデータを結合して返却
    const allDbSubmissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { epochSecond: 'desc' },
    });

    return NextResponse.json(allDbSubmissions);

  } catch (error) {
    console.error('Error syncing submission data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
