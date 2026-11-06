'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Pencil } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import type { AtCoderFetchStatus } from '@/features/auth/types';
import { retryAtCoderFetch } from '@/features/auth/actions/retry-atcoder-fetch';
import { useLinkAtCoderId } from '@/features/auth/hooks/use-link-atcoder-id';

const FETCH_STATUS_POLL_MS = 3000;

interface AtCoderIdSwitcherProps {
  currentAtCoderId: string | null;
  fetchStatus: AtCoderFetchStatus | null;
}

export default function AtCoderIdSwitcher({
  currentAtCoderId,
  fetchStatus,
}: AtCoderIdSwitcherProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const { error, isLoading, link, setError } = useLinkAtCoderId();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession();

  // 裏で全件を取っている間は、終わったら表示されるように画面を読み直し続ける
  useEffect(() => {
    if (fetchStatus !== 'fetching') {
      return;
    }
    const timer = setInterval(() => router.refresh(), FETCH_STATUS_POLL_MS);
    return () => clearInterval(timer);
  }, [fetchStatus, router]);

  function startEditing() {
    setValue(currentAtCoderId ?? '');
    setError(null);
    setIsEditing(true);
  }

  function stopEditing() {
    setError(null);
    setIsEditing(false);
  }

  async function submit() {
    if (await link(value)) {
      await update();
      setIsEditing(false);
      router.refresh();
    }
  }

  async function retryFetch() {
    setIsRetrying(true);
    setRetryError(null);
    const result = await retryAtCoderFetch();
    if (result.ok) {
      router.refresh();
    } else {
      setRetryError(result.error.message);
    }
    setIsRetrying(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (isLoading) {
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      void submit();
    } else if (event.key === 'Escape') {
      stopEditing();
    }
  }

  if (!isEditing) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={startEditing}
          className="inline-flex h-9 min-w-48 items-center justify-between gap-2 rounded-md border border-slate-300 px-3 text-sm text-slate-900 hover:bg-slate-50"
        >
          <span className="inline-flex items-center gap-2">
            {fetchStatus === 'fetching' && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
            )}
            {fetchStatus === 'failed' && (
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            )}
            {currentAtCoderId ?? 'AtCoder IDを連携'}
          </span>
          <Pencil className="h-4 w-4 text-slate-500" />
        </button>
        {fetchStatus === 'fetching' && (
          <p
            role="status"
            className="absolute right-0 top-full z-10 mt-1 w-64 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
          >
            AtCoderからデータを取得しています。提出の多いIDだと数十秒〜数分かかります。
          </p>
        )}
        {fetchStatus === 'failed' && (
          <div
            role="alert"
            className="absolute right-0 top-full z-10 mt-1 w-64 space-y-2 rounded-md border border-red-200 bg-white px-3 py-2 text-xs text-red-600"
          >
            <p>{retryError ?? 'AtCoderからデータを取得できませんでした。'}</p>
            <Button
              size="sm"
              variant="brand"
              className="h-7 w-full"
              onClick={retryFetch}
              disabled={isRetrying}
            >
              {isRetrying ? 'やり直しています...' : 'もう一度取得'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        autoFocus
        aria-label="AtCoder ID"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={() => {
          if (!isLoading) {
            stopEditing();
          }
        }}
        readOnly={isLoading}
        maxLength={16}
        placeholder="chokudai"
        className="h-9 w-48 rounded-md border border-blue-600 px-3 pr-8 text-sm text-slate-900 outline-none"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
      )}
      {error && (
        <p
          role="alert"
          className="absolute right-0 top-full z-10 mt-1 w-64 rounded-md border border-red-200 bg-white px-3 py-2 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
