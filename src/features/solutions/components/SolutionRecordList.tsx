'use client';

import { Plus } from 'lucide-react';

import { formatSolutionRecordLabel } from '@/features/solutions/functions/solution-editor';
import { getSolutionStatusOption } from '@/features/solutions/functions/solution-status';
import type {
  SolutionRecordListItem,
  SolutionStatus,
} from '@/features/solutions/types';
import { cn } from '@/lib/utils';

interface SolutionRecordListProps {
  activeSolutionId: string | null;
  records: SolutionRecordListItem[];
  title: string;
  status: SolutionStatus;
  onCreateRecord: () => void;
  onSelectRecord: (solutionId: string) => void;
}

export default function SolutionRecordList({
  activeSolutionId,
  records,
  title,
  status,
  onCreateRecord,
  onSelectRecord,
}: SolutionRecordListProps) {
  // 書き始める前の新しい記録や保存したばかりの記録は、まだ一覧に入っていないため末尾に足して見せる
  const isActiveRecordListed = records.some((record) => record.id === activeSolutionId);
  // 何も書いていない新しい記録をもう1つ作っても意味がないため、保存済みの記録を開いているときだけ出す
  const canCreateRecord = activeSolutionId !== null;

  return (
    <div className="space-y-1.5">
      {records.map((record, index) => {
        const isActive = record.id === activeSolutionId;
        return (
          <SolutionRecordRow
            key={record.id}
            label={formatSolutionRecordLabel(isActive ? { title } : record, index)}
            status={isActive ? status : record.status}
            isActive={isActive}
            onSelect={() => onSelectRecord(record.id)}
          />
        );
      })}
      {!isActiveRecordListed && (
        <SolutionRecordRow
          label={formatSolutionRecordLabel({ title }, records.length)}
          status={status}
          isActive
        />
      )}
      {canCreateRecord && (
        <button
          type="button"
          onClick={onCreateRecord}
          aria-label="新しい記録を作る"
          title="新しい記録を作る"
          className="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 py-2 text-slate-400 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700"
        >
          <Plus className="size-4" />
        </button>
      )}
    </div>
  );
}

function SolutionRecordRow({
  label,
  status,
  isActive,
  onSelect,
}: {
  label: string;
  status: SolutionStatus;
  isActive: boolean;
  onSelect?: () => void;
}) {
  const statusOption = getSolutionStatusOption(status);
  const className = cn(
    'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
    isActive
      ? 'border-blue-600 bg-blue-50 text-blue-900'
      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
  );
  const content = (
    <>
      <span className="min-w-0 truncate">{label}</span>
      {statusOption && (
        <span className={cn('shrink-0 text-xs', statusOption.textClassName)}>
          {statusOption.label}
        </span>
      )}
    </>
  );

  if (!onSelect) {
    return (
      <div aria-current={isActive ? 'true' : undefined} className={className}>
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      aria-current={isActive ? 'true' : undefined}
      onClick={onSelect}
      className={className}
    >
      {content}
    </button>
  );
}
