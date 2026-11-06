'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import LinkAtCoderDialog from '@/features/auth/components/LinkAtCoderDialog';

export default function LinkAtCoderPrompt() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
      <p>
        AtCoder IDが連携されていません。連携すると、あなたの提出・レート・AC数が表示されます。
      </p>
      <Button size="sm" onClick={() => setDialogOpen(true)}>
        <Link2 className="h-4 w-4" />
        AtCoder IDを連携する
      </Button>
      <LinkAtCoderDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
