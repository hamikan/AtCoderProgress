'use client';

import { useState } from 'react';

import { deleteAccount } from '@/features/auth/actions/delete-account';

export function useDeleteAccount() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(confirmation: string) {
    setError(null);
    setIsDeleting(true);
    try {
      const result = await deleteAccount(confirmation);
      if (!result.ok) {
        setError(result.error.message);
        setIsDeleting(false);
        return;
      }
      // 画面に残ったログイン中の状態ごと捨てるため、読み込み直してトップへ戻る
      window.location.assign('/');
    } catch {
      setError('アカウントを削除できませんでした。時間をおいてもう一度お試しください。');
      setIsDeleting(false);
    }
  }

  return { error, isDeleting, submit };
}
