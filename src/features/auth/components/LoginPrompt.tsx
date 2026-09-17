import Link from 'next/link';
import { LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface LoginPromptProps {
  description?: string;
  returnTo: string;
}

export default function LoginPrompt({
  description = 'ログインすると、あなたの学習データを表示・保存できます。',
  returnTo,
}: LoginPromptProps) {
  const href = `/login?callbackUrl=${encodeURIComponent(returnTo)}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
      <p>{description}</p>
      <Button asChild size="sm">
        <Link href={href}>
          <LogIn className="h-4 w-4" />
          ログイン
        </Link>
      </Button>
    </div>
  );
}
