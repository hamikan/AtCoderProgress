'use client';

import { useEffect, useRef } from 'react';
import { Loader2, X } from 'lucide-react';

import type { SolutionRecordDeletePhase } from '@/features/solutions/types';

interface SolutionRecordDeleteConfirmProps {
  label: string;
  phase: SolutionRecordDeletePhase;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SolutionRecordDeleteConfirm({
  label,
  phase,
  onCancel,
  onConfirm,
}: SolutionRecordDeleteConfirmProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDeleting = phase === 'deleting';

  useEffect(() => {
    if (isDeleting) {
      return;
    }
    // Safari はボタンを押してもフォーカスが移らず blur では外側を押したか判別できないため、押した場所で判断する
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onCancel();
      }
    };
    // 小さい画面でサイドバーを閉じる Esc より先に受け取り、確認だけを閉じる
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDeleting, onCancel]);

  return (
    <div ref={containerRef}>
      <div
        role="group"
        aria-label={`「${label}」を消すか確かめる`}
        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 py-1 pl-3 pr-1 text-sm text-red-700"
      >
        <span className="flex min-w-0 flex-1 items-baseline">
          <span className="truncate">{label}</span>
          <span className="shrink-0">を消しますか？</span>
        </span>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-slate-900 px-2.5 text-xs font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {isDeleting && <Loader2 className="size-3 animate-spin" />}
          消す
        </button>
        {/* ゴミ箱と同じ位置に置き、うっかり2回押しても消えないようにする */}
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          disabled={isDeleting}
          aria-label="消すのをやめる"
          title="やめる"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-red-400 transition-colors hover:bg-red-100 hover:text-red-700 disabled:opacity-40"
        >
          <X className="size-4" />
        </button>
      </div>
      {phase === 'failed' && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          消せませんでした。もう一度「消す」を押してください。
        </p>
      )}
    </div>
  );
}
