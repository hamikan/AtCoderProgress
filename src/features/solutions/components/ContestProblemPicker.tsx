'use client';

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getDifficultyColor, getDifficultyOrbColor } from '@/lib/atcoder/difficulty';
import type { SolutionSidebarProblemOption } from '@/features/solutions/types';

interface ContestProblemPickerProps {
  contestName: string;
  options: SolutionSidebarProblemOption[];
  onSelectProblem: (problemId: string) => void;
}

export default function ContestProblemPicker({
  contestName,
  options,
  onSelectProblem,
}: ContestProblemPickerProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(problemId: string) {
    setOpen(false);
    onSelectProblem(problemId);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${contestName} の問題を選んで解法記録を追加`}
          title="この回の解法記録を追加"
          className="absolute right-1 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 opacity-0 outline-none transition-opacity hover:bg-slate-200 hover:text-slate-900 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-emerald-500 group-hover/contest-row:opacity-100 data-[state=open]:bg-slate-200 data-[state=open]:opacity-100 pointer-coarse:opacity-100"
        >
          <Plus className="size-3.5" />
        </button>
      </PopoverTrigger>

      <PopoverContent side="right" align="start" className="w-72 gap-1 p-1">
        <p className="px-2 pb-1 pt-1.5 text-xs font-semibold text-slate-500">
          {contestName} の問題
        </p>
        <ul className="max-h-80 overflow-y-auto">
          {options.map((option) => (
            <li key={option.problemId}>
              <button
                type="button"
                onClick={() => handleSelect(option.problemId)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-slate-100 focus-visible:bg-slate-100"
              >
                <span
                  aria-hidden
                  className={`size-2.5 shrink-0 rounded-full border border-black/15 ${getDifficultyOrbColor(option.difficulty)}`}
                />
                <span className="min-w-0 flex-1 truncate">
                  {option.problemIndex} - {option.problemName}
                </span>
                {option.recorded && (
                  <Check aria-label="記録済み" className="size-3.5 shrink-0 text-emerald-600" />
                )}
                <span
                  className={`w-8 shrink-0 text-right text-[10px] font-bold ${getDifficultyColor(option.difficulty)}`}
                >
                  {option.difficulty}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
