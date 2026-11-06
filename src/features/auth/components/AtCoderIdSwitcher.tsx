'use client';

import { useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { useLinkAtCoderId } from '@/features/auth/hooks/use-link-atcoder-id';

interface AtCoderIdSwitcherProps {
  currentAtCoderId: string | null;
}

export default function AtCoderIdSwitcher({ currentAtCoderId }: AtCoderIdSwitcherProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const { error, isLoading, link, setError, showSlowNote } = useLinkAtCoderId();
  const router = useRouter();
  const { update } = useSession();

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
      <button
        type="button"
        onClick={startEditing}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 px-2.5 text-sm text-slate-900 hover:bg-slate-50"
      >
        {currentAtCoderId ? (
          <>
            <span className="hidden text-slate-500 sm:inline">AtCoder</span>
            <span>{currentAtCoderId}</span>
          </>
        ) : (
          <span>AtCoder IDを連携</span>
        )}
        <Pencil className="h-3.5 w-3.5 text-slate-500" />
      </button>
    );
  }

  const message = error ?? (showSlowNote
    ? 'AtCoderからデータを取得しています。提出の多いIDだと数十秒かかることがあります。'
    : null);

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
        className="h-8 w-40 rounded-md border border-blue-600 px-2.5 pr-7 text-sm text-slate-900 outline-none"
      />
      {isLoading && (
        <Loader2 className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-slate-400" />
      )}
      {message && (
        <p
          role={error ? 'alert' : 'status'}
          className={`absolute right-0 top-full z-10 mt-1 w-64 rounded-md border bg-white px-3 py-2 text-xs ${error ? 'border-red-200 text-red-600' : 'border-slate-200 text-slate-600'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
