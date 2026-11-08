'use client';

import { useState, type KeyboardEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  DELETE_ACCOUNT_CONFIRMATION,
  isDeleteAccountConfirmed,
} from '@/features/auth/functions/delete-account-confirmation';
import { useDeleteAccount } from '@/features/auth/hooks/use-delete-account';

export default function DeleteAccountSection() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const { error, isDeleting, submit } = useDeleteAccount();
  const canDelete = isDeleteAccountConfirmed(confirmation) && !isDeleting;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // メニューの頭文字での移動に文字を取られないよう止める。Esc はメニューを閉じるので通す
    if (event.key !== 'Escape') {
      event.stopPropagation();
    }
    // 変換を確定する Enter でアカウントを削除しないようにする
    if (event.key === 'Enter' && !event.nativeEvent.isComposing && canDelete) {
      event.preventDefault();
      void submit(confirmation);
    }
  }

  function handleCancel() {
    setIsConfirming(false);
    setConfirmation('');
  }

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="w-full rounded-sm px-2 py-1.5 text-left text-xs text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        アカウント削除
      </button>
    );
  }

  return (
    <div className="space-y-2 px-2 py-2 text-xs">
      <p className="leading-relaxed text-slate-600">
        アカウントを削除すると、解法記録と自分で作ったタグがすべて消え、元に戻せません。続けるときは「
        {DELETE_ACCOUNT_CONFIRMATION}」と入力してください。
      </p>
      <input
        type="text"
        autoFocus
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isDeleting}
        aria-label="確認の言葉"
        placeholder={DELETE_ACCOUNT_CONFIRMATION}
        className="h-8 w-full rounded-md border border-slate-200 px-2 text-sm outline-none transition-colors placeholder:text-slate-300 focus:border-red-300"
      />
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={!canDelete}
          onClick={() => void submit(confirmation)}
          className="h-7 flex-1 text-xs"
        >
          {isDeleting ? '削除しています…' : '削除する'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isDeleting}
          onClick={handleCancel}
          className="h-7 text-xs"
        >
          やめる
        </Button>
      </div>
    </div>
  );
}
