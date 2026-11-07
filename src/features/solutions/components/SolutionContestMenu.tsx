'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProblemContestOption } from '@/features/problems/types';

interface SolutionContestMenuProps {
  contestId: string | null;
  contests: ProblemContestOption[];
  onContestChange: (contestId: string) => void;
}

export default function SolutionContestMenu({
  contestId,
  contests,
  onContestChange,
}: SolutionContestMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-6 shrink-0 px-2 text-xs">
          変更
        </Button>
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
