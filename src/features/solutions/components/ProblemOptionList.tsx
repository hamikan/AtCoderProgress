'use client';

import { Check } from 'lucide-react';
import { getDifficultyColor, getDifficultyOrbColor } from '@/lib/atcoder/difficulty';
import type { SolutionSidebarProblemOption } from '@/features/solutions/types';

interface ProblemOptionListProps {
  options: SolutionSidebarProblemOption[];
  onSelect: (problemId: string) => void;
}

export default function ProblemOptionList({ options, onSelect }: ProblemOptionListProps) {
  return (
    <ul className="max-h-80 overflow-y-auto">
      {options.map((option) => (
        <li key={option.problemId}>
          <button
            type="button"
            onClick={() => onSelect(option.problemId)}
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
  );
}
