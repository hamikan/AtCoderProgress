
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();

  // セッション情報取得中
  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">読み込み中...</div>;
  }

  // 未認証
  if (status === 'unauthenticated') {
    // 基本的にこのコンポーネントは認証後に表示されるが、念のため
    return <div className="flex items-center justify-center h-screen">アクセス権がありません。</div>;
  }

  // AtCoder IDがまだ連携されていないユーザー
  // @ts-ignore next-authの型拡張が必要
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

  // 認証済みで、AtCoder IDも連携済みのユーザー
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">ようこそ、{session?.user?.name}さん！</h1>
      {/* @ts-ignore next-authの型拡張が必要 */}
      <p className="text-xl text-gray-700">あなたのAtCoder ID: {session?.user?.atcoderId}</p>
      
      <div className="mt-8">
        <p>ここにダッシュボードのコンテンツ（ヒートマップ、レーダーチャートなど）が表示されます。</p>
      </div>
    </div>
  );
}
