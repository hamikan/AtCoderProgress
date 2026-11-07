'use client';

import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProblemContestOption } from '@/features/problems/types';

interface SolutionContestMenuProps {
  label: string;
  contestId: string | null;
  contests: ProblemContestOption[];
  onContestChange: (contestId: string) => void;
}

export default function SolutionContestMenu({
  label,
  contestId,
  contests,
  onContestChange,
}: SolutionContestMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`コンテストを変える（今は ${label}）`}
          className="-ml-1.5 inline-flex min-w-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="size-3.5 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
        <DropdownMenuRadioGroup value={contestId ?? ''} onValueChange={onContestChange}>
          {contests.map((contest) => (
            <DropdownMenuRadioItem key={contest.contestId} value={contest.contestId}>
              {contest.contestId.toUpperCase()} / {contest.problemIndex}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
