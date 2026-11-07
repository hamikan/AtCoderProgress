'use client';

import { Check, ChevronDown } from 'lucide-react';

import {
  getSolutionStatusOption,
  SOLUTION_STATUS_OPTIONS,
} from '@/features/solutions/functions/solution-status';
import { useInlineDisclosure } from '@/features/solutions/hooks/use-inline-disclosure';
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
  const { close, isOpen, open, panelRef, toggleRef } = useInlineDisclosure();
  const current = getSolutionStatusOption(status) ?? SOLUTION_STATUS_OPTIONS[0];

  if (!isOpen) {
    return (
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={false}
        aria-label={`ステータス: ${current.label}`}
        onClick={open}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
          current.badgeClassName
        )}
      >
        <span className={cn('size-2 rounded-full', current.dotClassName)} />
        {current.label}
        <ChevronDown className="size-3.5 opacity-60" />
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      role="group"
      aria-label="ステータス"
      className="rounded-lg border border-slate-200 bg-white p-1"
    >
      {SOLUTION_STATUS_OPTIONS.map((option) => {
        const isSelected = option.value === current.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            autoFocus={isSelected}
            onClick={() => {
              onStatusChange(option.value);
              close(true);
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-slate-50',
              option.textClassName,
              isSelected && 'font-medium'
            )}
          >
            <span className={cn('size-2 shrink-0 rounded-full', option.dotClassName)} />
            <span className="flex-1">{option.label}</span>
            {isSelected && <Check className="size-3.5" />}
          </button>
        );
      })}
    </div>
  );
}
