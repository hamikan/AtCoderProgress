
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// AtCoderの提出データの型定義
interface Submission {
  id: number;
  epoch_second: number;
  problem_id: string;
  contest_id: string;
  user_id: string;
  language: string;
  point: number;
  length: number;
  result: string;
  execution_time: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // @ts-ignore
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
          const data = await res.json();
          setSubmissions(data);
        } catch (err) {
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

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">読み込み中...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex items-center justify-center h-screen">アクセス権がありません。</div>;
  }

  // @ts-ignore
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
          <h2 className="text-2xl font-semibold">提出履歴</h2>
          <p>取得した提出数: {submissions.length}</p>
          <p>（ここにヒートマップやチャートが表示されます）</p>
        </div>
      )}
    </div>
  );
}
