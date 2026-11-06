'use client';

import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';

interface LoginPromptProps {
  description?: string;
  returnTo: string;
}

export default function LoginPrompt({
  description = 'ログインすると、あなたの学習データを表示・保存できます。',
  returnTo,
}: LoginPromptProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
      <p>{description}</p>
      <Button
        size="sm"
        variant="brand"
        onClick={() => signIn('github', { callbackUrl: returnTo })}
      >
        <LogIn className="h-4 w-4" />
        ログイン
      </Button>
    </div>
  );
}
