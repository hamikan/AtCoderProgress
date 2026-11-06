'use client';

import { useState } from 'react';

import { unlinkProvider } from '@/features/auth/actions/unlink-provider';

export function useUnlinkProvider() {
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unlink(providerId: string): Promise<boolean> {
    setError(null);
    setIsUnlinking(true);
    try {
      const result = await unlinkProvider(providerId);
      if (!result.ok) {
        setError(result.error.message);
        return false;
      }
      return true;
    } catch {
      setError('ログイン方法の解除に失敗しました。もう一度お試しください。');
      return false;
    } finally {
      setIsUnlinking(false);
    }
  }

  return { error, isUnlinking, unlink };
}
