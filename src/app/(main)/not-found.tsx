import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function MainNotFound() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">ページが見つかりません</h1>
        <p className="text-sm leading-6 text-slate-600">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Button asChild>
          <Link href="/dashboard">ダッシュボードに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
