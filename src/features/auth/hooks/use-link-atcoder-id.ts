'use client';

import { useState } from 'react';

import { linkAtCoderId } from '@/features/auth/actions/link-atcoder-id';
import { validateAtCoderId } from '@/features/auth/schemas/atcoder-id';

export function useLinkAtCoderId() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function link(input: string): Promise<boolean> {
    const validation = validateAtCoderId(input);
    if (!validation.ok) {
      setError(validation.error);
      return false;
    }

    setError(null);
    setIsLoading(true);
    try {
      const result = await linkAtCoderId(validation.value);
      if (!result.ok) {
        setError(result.error.message);
        return false;
      }
      return true;
    } catch {
      setError('連携に失敗しました。もう一度お試しください。');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { error, isLoading, link, setError };
}
