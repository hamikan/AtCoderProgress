// app/(main)/page.tsx
'use client'; // useRouterを使うため、クライアントコンポーネントにする

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [atcoderId, setAtcoderId] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // フォームのデフォルトの送信動作を防ぐ
    if (atcoderId.trim()) { // 入力があるかチェック
      router.push(`/${atcoderId}`); // 入力されたIDで動的ルートへ遷移
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            AtCoder Progress
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            あなたのAtCoder学習記録を可視化します。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
          <input
            type="text"
            value={atcoderId}
            onChange={(e) => setAtcoderId(e.target.value)}
            placeholder="AtCoder IDを入力してください"
            className="w-full px-4 py-3 text-lg border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            記録を見る
          </button>
        </form>

        <p className="text-xs text-center text-gray-500">
          ※ AtCoder Problemsのデータを利用しています。
        </p>
      </div>
    </div>
  );
}
