'use client';

import { SOLUTION_STATUS_OPTIONS } from '@/features/solutions/functions/solution-status';
import type { SolutionStatus } from '@/features/solutions/types';
import { cn } from '@/lib/utils';

interface SolutionStatusPickerProps {
  status: SolutionStatus;
  onStatusChange: (status: SolutionStatus) => void;
}

export default function SolutionStatusPicker({
  status,
  onStatusChange,
}: SolutionStatusPickerProps) {
  return (
    <div role="group" aria-label="ステータス" className="flex flex-wrap gap-1.5">
      {SOLUTION_STATUS_OPTIONS.map((option) => {
        const isSelected = option.value === status;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onStatusChange(option.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              isSelected
                ? cn('font-medium', option.selectedClassName)
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
