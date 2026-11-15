'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface MainErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ reset }: MainErrorProps) {
  return (
    <div className="flex h-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">表示できませんでした</h1>
        <p className="text-sm leading-6 text-slate-600">
          一時的な問題が起きた可能性があります。もう一度お試しください。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button type="button" onClick={reset}>
            もう一度試す
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">ダッシュボードに戻る</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
