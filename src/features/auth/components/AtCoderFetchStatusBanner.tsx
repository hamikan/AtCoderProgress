'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { retryAtCoderFetch } from '@/features/auth/actions/retry-atcoder-fetch';
import type { AtCoderFetchStatus } from '@/features/auth/types';

interface AtCoderFetchStatusBannerProps {
  status: AtCoderFetchStatus;
}

export default function AtCoderFetchStatusBanner({ status }: AtCoderFetchStatusBannerProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'ready') {
    return null;
  }

  if (status === 'fetching') {
    return (
      <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
        AtCoderからデータを取得しています。提出の多いIDだと数十秒〜数分かかります。終わると自動で表示されます。
      </div>
    );
  }

  async function retry() {
    setIsRetrying(true);
    setError(null);
    const result = await retryAtCoderFetch();
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error.message);
    }
    setIsRetrying(false);
  }

  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
      <p>{error ?? 'AtCoderからデータを取得できませんでした。'}</p>
      <Button size="sm" variant="brand" onClick={retry} disabled={isRetrying}>
        {isRetrying ? 'やり直しています...' : 'もう一度取得'}
      </Button>
    </div>
  );
}
