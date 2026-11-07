'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import SolutionRecordDeleteConfirm from '@/features/solutions/components/SolutionRecordDeleteConfirm';
import { formatSolutionRecordLabel } from '@/features/solutions/functions/solution-editor';
import { getSolutionStatusOption } from '@/features/solutions/functions/solution-status';
import type {
  SolutionRecordDeletePhase,
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
  onDeleteRecord: (solutionId: string) => Promise<boolean>;
  onSelectRecord: (solutionId: string) => void;
}

interface DeleteTarget {
  id: string;
  phase: SolutionRecordDeletePhase;
}

export default function SolutionRecordList({
  activeSolutionId,
  records,
  title,
  status,
  onCreateRecord,
  onDeleteRecord,
  onSelectRecord,
}: SolutionRecordListProps) {
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  // 一覧の読み直しが届くまで、消した記録が残って見えないようにする
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const shownRecords = records.filter((record) => !deletedIds.includes(record.id));
  // 書き始める前の新しい記録や保存したばかりの記録は、まだ一覧に入っていないため末尾に足して見せる
  const isActiveRecordListed = shownRecords.some((record) => record.id === activeSolutionId);
  // 何も書いていない新しい記録をもう1つ作っても意味がないため、保存済みの記録を開いているときだけ出す
  const canCreateRecord = activeSolutionId !== null;

  async function handleConfirmDelete(solutionId: string) {
    setDeleteTarget({ id: solutionId, phase: 'deleting' });
    const ok = await onDeleteRecord(solutionId);
    if (!ok) {
      setDeleteTarget({ id: solutionId, phase: 'failed' });
      return;
    }
    // 開いている記録を消したときは別の画面へ移るので、移り終わるまで「消しています」のままにする
    if (solutionId !== activeSolutionId) {
      setDeletedIds((ids) => [...ids, solutionId]);
      setDeleteTarget(null);
    }
  }

  function renderRecord({
    id,
    label,
    status: recordStatus,
    isActive,
    onSelect,
  }: {
    id: string | null;
    label: string;
    status: SolutionStatus;
    isActive: boolean;
    onSelect?: () => void;
  }) {
    if (id && deleteTarget?.id === id) {
      return (
        <SolutionRecordDeleteConfirm
          key={id}
          label={label}
          phase={deleteTarget.phase}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleConfirmDelete(id)}
        />
      );
    }
    return (
      <SolutionRecordRow
        key={id ?? 'draft'}
        label={label}
        status={recordStatus}
        isActive={isActive}
        onSelect={onSelect}
        onDelete={id ? () => setDeleteTarget({ id, phase: 'confirming' }) : undefined}
      />
    );
  }

  return (
    <div className="space-y-1.5">
      {shownRecords.map((record, index) => {
        const isActive = record.id === activeSolutionId;
        return renderRecord({
          id: record.id,
          label: formatSolutionRecordLabel(isActive ? { title } : record, index),
          status: isActive ? status : record.status,
          isActive,
          onSelect: () => onSelectRecord(record.id),
        });
      })}
      {!isActiveRecordListed &&
        renderRecord({
          id: activeSolutionId,
          label: formatSolutionRecordLabel({ title }, shownRecords.length),
          status,
          isActive: true,
        })}
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
  onDelete,
}: {
  label: string;
  status: SolutionStatus;
  isActive: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}) {
  const statusOption = getSolutionStatusOption(status);
  const mainClassName =
    'flex min-w-0 flex-1 items-center justify-between gap-2 py-2 pl-3 text-left';
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

  return (
    <div
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'group flex items-center gap-1 rounded-lg border pr-1 text-sm transition-colors',
        isActive
          ? 'border-blue-600 bg-blue-50 text-blue-900'
          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
      )}
    >
      {onSelect ? (
        <button type="button" onClick={onSelect} className={mainClassName}>
          {content}
        </button>
      ) : (
        <div className={mainClassName}>{content}</div>
      )}
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`「${label}」を消す`}
          title="この記録を消す"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : (
        <span aria-hidden="true" className="size-7 shrink-0" />
      )}
    </div>
  );
}
