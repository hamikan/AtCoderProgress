import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Submission } from '@/types/submission';

const API_ENDPOINT = 'https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions';

export async function GET(request: NextRequest, { params }: { params: { atcoderId: string } }) {
  // ログインしているユーザーか確認 (他のユーザーのデータを勝手に見られないように)
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { atcoderId } = await params;
  if (!atcoderId) {
    return NextResponse.json({ error: 'AtCoder ID is required' }, { status: 400 });
  }

  // スリープ関数
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let allSubmissions: Submission[] = [];
  let fromSecond = 0; // 最初の取得開始時刻
  const limit = 500; // APIの取得上限

  try {
    while (true) {
      const url = `${API_ENDPOINT}?user=${atcoderId}&from_second=${fromSecond}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.text();
        return NextResponse.json(
          { error: `Failed to fetch data from AtCoder Problems API: ${errorData}` },
          { status: response.status }
        );
      }

      const data: Submission[] = await response.json();

      if (data.length === 0) {
        // データがもうない場合、ループを終了
        break;
      }

      allSubmissions = allSubmissions.concat(data);

      if (data.length < limit) {
        // 取得件数が上限未満の場合、それが最後のページ
        break;
      }

      // 次の取得開始時刻を、今回取得した中で最も古い提出の時刻の1秒前に設定
      // 提出は新しい順に返されると仮定
      const lastSubmission = data[data.length - 1];
      fromSecond = lastSubmission.epoch_second + 1;

      // APIアクセスの合間に1秒以上のスリープ
      await sleep(1500);
    }

    return NextResponse.json(allSubmissions);

  } catch (error) {
    console.error('Error fetching submission data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
