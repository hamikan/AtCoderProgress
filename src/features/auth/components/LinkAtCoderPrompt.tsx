import Link from 'next/link';
import { Link2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function LinkAtCoderPrompt() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
      <p>
        AtCoder IDが連携されていません。連携すると、あなたの提出・レート・AC数が表示されます。
      </p>
      <Button asChild size="sm">
        <Link href="/link-atcoder">
          <Link2 className="h-4 w-4" />
          AtCoder IDを連携する
        </Link>
      </Button>
    </div>
  );
}
