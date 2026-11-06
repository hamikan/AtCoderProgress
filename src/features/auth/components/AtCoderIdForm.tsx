'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { linkAtCoderId } from '@/features/auth/actions/link-atcoder-id';
import { validateAtCoderId } from '@/features/auth/schemas/atcoder-id';

// すでにデータがある ID はすぐ終わるので、しばらく待っても終わらないときだけ案内を出す
const SLOW_LINK_NOTE_DELAY_MS = 1500;

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
  const [isLoading, setIsLoading] = useState(false);
  const [showSlowNote, setShowSlowNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      setError('保存するにはログインが必要です。');
      return;
    }

    const validation = validateAtCoderId(atcoderId);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setError(null);
    setIsLoading(true);
    const slowNoteTimer = setTimeout(
      () => setShowSlowNote(true),
      SLOW_LINK_NOTE_DELAY_MS
    );
    try {
      const result = await linkAtCoderId(validation.value);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      await onLinked();
    } catch {
      setError('連携に失敗しました。もう一度お試しください。');
    } finally {
      clearTimeout(slowNoteTimer);
      setShowSlowNote(false);
      setIsLoading(false);
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

      {showSlowNote && (
        <p role="status" className="text-sm text-gray-600">
          AtCoderからデータを取得しています。提出の多いIDだと数十秒かかることがあります。このままお待ちください。
        </p>
      )}
    </form>
  );
}
