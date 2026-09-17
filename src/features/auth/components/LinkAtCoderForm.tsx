'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { linkAtCoderId } from '@/features/auth/actions/link-atcoder-id';
import { validateAtCoderId } from '@/features/auth/schemas/atcoder-id';

interface LinkAtCoderFormProps {
  canSubmit: boolean;
}

export default function LinkAtCoderForm({ canSubmit }: LinkAtCoderFormProps) {
  const [atcoderId, setAtCoderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      setError('保存するにはログインが必要です。');
      return;
    }
    setIsLoading(true);
    setError(null);

    const validation = validateAtCoderId(atcoderId);
    if (!validation.ok) {
      setError(validation.error);
      setIsLoading(false);
      return;
    }

    try {
      const result = await linkAtCoderId(validation.value);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      await update();
      router.push('/');
    } catch {
      setError('連携に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-full space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">メインAtCoder IDを設定</h1>
          <p className="mt-2 text-gray-600">あなたの分析に使うAtCoder IDを入力してください。</p>
          <p className="mt-2 text-sm text-gray-500">設定後7日間は別のIDへ変更できません。</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                onChange={(event) => setAtCoderId(event.target.value)}
                maxLength={16}
                minLength={3}
                pattern="[A-Za-z0-9_]{3,16}"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="chokudai"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !canSubmit}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
          >
            {isLoading ? '設定中...' : canSubmit ? '設定して始める' : 'ログイン後に設定できます'}
          </button>
        </form>
      </div>
    </div>
  );
}
