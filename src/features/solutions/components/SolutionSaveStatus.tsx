import { Check, Loader2, X } from 'lucide-react';

import type { SolutionSaveState } from '@/features/solutions/types';

export default function SolutionSaveStatus({ saveState }: { saveState: SolutionSaveState }) {
  if (saveState === 'saving') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-slate-400">
        <Loader2 className="size-3.5 animate-spin" />
        保存中
      </span>
    );
  }
  if (saveState === 'saved') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-emerald-600">
        <Check className="size-3.5" />
        保存済み
      </span>
    );
  }
  if (saveState === 'error') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-red-600">
        <X className="size-3.5" />
        保存できませんでした
      </span>
    );
  }
  return null;
}
