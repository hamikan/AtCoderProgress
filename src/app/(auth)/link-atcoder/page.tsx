
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // useSessionをインポート

export default function LinkAtCoderPage() {
  const [atcoderId, setAtcoderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession(); // useSessionからupdate関数を取得

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!atcoderId.trim()) {
      setError('AtCoder IDを入力してください。');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/atcoder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ atcoderId }),
      });

      if (res.ok) {
        // セッション情報を更新
        await update(); 
        // 成功したらダッシュボード（メインページ）へリダイレクト
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || '連携に失敗しました。');
      }
    } catch {
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AtCoder IDを連携</h1>
          <p className="mt-2 text-gray-600">最後に、あなたのAtCoder IDを教えてください。</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="atcoderId" className="block text-sm font-medium text-gray-700">
              AtCoder ID
            </label>
            <div className="mt-1">
              <input
                id="atcoderId"
                name="atcoderId"
                type="text"
                value={atcoderId}
                onChange={(e) => setAtcoderId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="chokudai"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? '連携中...' : '連携して始める'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
