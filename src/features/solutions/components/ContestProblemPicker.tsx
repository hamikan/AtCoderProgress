'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ProblemOptionList from '@/features/solutions/components/ProblemOptionList';
import SidebarAddProblemButton from '@/features/solutions/components/SidebarAddProblemButton';
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
        <SidebarAddProblemButton
          aria-label={`${contestName} の問題を選んで解法記録を追加`}
          title="この回の解法記録を追加"
        />
      </PopoverTrigger>

      <PopoverContent side="right" align="start" className="w-72 gap-1 p-1">
        <p className="px-2 pb-1 pt-1.5 text-xs font-semibold text-slate-500">
          {contestName} の問題
        </p>
        <ProblemOptionList options={options} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
