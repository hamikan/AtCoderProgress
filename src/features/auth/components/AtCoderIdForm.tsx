'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLinkAtCoderId } from '@/features/auth/hooks/use-link-atcoder-id';

interface AtCoderIdFormProps {
  canSubmit: boolean;
  submitLabel: string;
  onLinked: () => Promise<void>;
}

export default function AtCoderIdForm({
  canSubmit,
  submitLabel,
  onLinked,
}: AtCoderIdFormProps) {
  const [atcoderId, setAtCoderId] = useState('');
  const { error, isLoading, link, setError } = useLinkAtCoderId();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      setError('保存するにはログインが必要です。');
      return;
    }
    if (await link(atcoderId)) {
      await onLinked();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="atcoderId">AtCoder ID</Label>
        <Input
          id="atcoderId"
          name="atcoderId"
          type="text"
          value={atcoderId}
          onChange={(event) => setAtCoderId(event.target.value)}
          maxLength={16}
          minLength={3}
          pattern="[A-Za-z0-9_]{3,16}"
          required
          placeholder="chokudai"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        variant="brand"
        disabled={isLoading || !canSubmit}
        className="w-full"
      >
        {isLoading ? '設定中...' : canSubmit ? submitLabel : 'ログイン後に設定できます'}
      </Button>

    </form>
  );
}
