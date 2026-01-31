'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Submission } from '@/types/submission';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const atcoderId = session?.user?.atcoderId;

  useEffect(() => {
    if (status === 'authenticated' && atcoderId) {
      const fetchSubmissions = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/users/${atcoderId}/submissions`);
          if (!res.ok) {
            throw new Error('データの取得に失敗しました。');
          }
          setSubmissions(await res.json());
        } catch (err) {
          // errがErrorオブジェクトのインスタンスであるかを確認
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('不明なエラーが発生しました。');
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchSubmissions();
    }
  }, [status, atcoderId]);

  // 提出データを日付ごとのカウントに加工
  const dailyCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    console.log("submissionsが変更された");
    submissions.forEach(submission => {
      // AC (Accepted) の提出のみをカウント
      if (submission.result === 'AC') {
        const date = new Date(submission.epochSecond * 1000);
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD形式
        counts[dateString] = (counts[dateString] || 0) + 1;
      }
    });
    return Object.keys(counts).map(date => ({
      date: new Date(date), // 文字列をDateオブジェクトに変換
      count: counts[date],
    }));
  }, [submissions]);

  // ヒートマップの開始日と終了日を計算
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1); // 過去1年間のデータ

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">読み込み中...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex items-center justify-center h-screen">アクセス権がありません。</div>;
  }

  if (session && !session.user?.atcoderId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="p-8 text-center bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold">AtCoder IDを連携してください</h1>
          <p className="mt-2 text-gray-600">機能を利用するには、まずAtCoder IDの連携が必要です。</p>
          <Link href="/link-atcoder" className="inline-block px-6 py-2 mt-4 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            連携ページへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">ようこそ、{session?.user?.name}さん！</h1>
      <p className="text-xl text-gray-700">あなたのAtCoder ID: {atcoderId}</p>

      {isLoading && <p className="mt-8">データを読み込んでいます...</p>}
      {error && <p className="mt-8 text-red-500">エラー: {error}</p>}

      {!isLoading && !error && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">学習のサマリー</h2>
          <h3 className="text-xl font-medium mb-2">カレンダーヒートマップ</h3>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={dailyCounts}
              classForValue={(value: { date: string; count: number } | null) => {
                if (!value) {
                  return 'color-empty';
                }
                // 提出数に応じて色を調整 (例: 1-4段階)
                if (value.count === 0) return 'color-empty';
                if (value.count < 3) return 'color-scale-1';
                if (value.count < 6) return 'color-scale-2';
                if (value.count < 10) return 'color-scale-3';
                return 'color-scale-4';
              }}
              tooltipDataAttrs={(value: { date: string; count: number } | null) => {
                if (!value || !value.date) {
                  return {
                    'data-tooltip-id': 'heatmap-tooltip',
                    'data-tooltip-content': 'No submissions',
                  };
                }
                return {
                  'data-tooltip-id': 'heatmap-tooltip',
                  'data-tooltip-content': `${value.date}: ${value.count} submissions`,
                };
              }}
              showWeekdayLabels={true}
            />
            <ReactTooltip id="heatmap-tooltip" /> */}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-medium mb-2">アルゴリズムタグごとのAC数レーダーチャート</h3>
            <p>（ここにレーダーチャートが表示されます）</p>
          </div>
        </div>
      )}
    </div>
  );
}

