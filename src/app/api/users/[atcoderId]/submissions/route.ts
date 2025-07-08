
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_ENDPOINT = 'https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions';

export async function GET(request: NextRequest, { params }: { params: { atcoderId: string } }) {
  // ログインしているユーザーか確認 (他のユーザーのデータを勝手に見られないように)
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // paramsをawaitしてプロパティにアクセス
  const { atcoderId } = await params;
  if (!atcoderId) {
    return NextResponse.json({ error: 'AtCoder ID is required' }, { status: 400 });
  }

  // from_second=0 で全期間のデータを取得
  const url = `${API_ENDPOINT}?user=${atcoderId}&from_second=0`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // APIからのエラーレスポンスをそのままクライアントに返す
      const errorData = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch data from AtCoder Problems API: ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching submission data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
