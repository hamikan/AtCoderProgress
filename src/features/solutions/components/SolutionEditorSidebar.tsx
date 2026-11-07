'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  ExternalLink,
  Loader2,
  Plus,
  X,
} from 'lucide-react';

import DifficultyCircle from '@/components/atcoder/DifficultyCircle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProblemInlineSearch from '@/features/solutions/components/ProblemInlineSearch';
import SolutionContestMenu from '@/features/solutions/components/SolutionContestMenu';
import SolutionStatusPicker from '@/features/solutions/components/SolutionStatusPicker';
import SolutionTagSelector from '@/features/solutions/components/SolutionTagSelector';
import { formatSolutionRecordLabel } from '@/features/solutions/functions/solution-editor';
import { getSolutionStatusOption } from '@/features/solutions/functions/solution-status';
import type { ProblemDetail, SelectableTag } from '@/features/problems/types';
import type {
  SolutionRecordListItem,
  SolutionSaveState,
  SolutionStatus,
} from '@/features/solutions/types';
import { getDifficultyColor } from '@/lib/atcoder/difficulty';
import { cn } from '@/lib/utils';

interface SolutionEditorSidebarProps {
  activeSolutionId: string | null;
  availableTags: SelectableTag[];
  contestId: string | null;
  hasCurrentContest: boolean;
  isAuthenticated: boolean;
  isOpen: boolean;
  onClose: () => void;
  onContestChange: (contestId: string) => void;
  onCreateRecord: () => void;
  onProblemSelected?: (problemId: string) => void;
  onSelectRecord: (solutionId: string) => void;
  onStatusChange: (status: SolutionStatus) => void;
  onTagsChange: (tags: string[]) => void;
  onTitleChange: (title: string) => void;
  problem: ProblemDetail | null;
  relatedSolutions: SolutionRecordListItem[];
  saveState: SolutionSaveState;
  selectedTags: string[];
  status: SolutionStatus;
  title: string;
}

const SECTION_LABEL_CLASS_NAME = 'text-xs font-medium text-slate-500';

export default function SolutionEditorSidebar({
  activeSolutionId,
  availableTags,
  contestId,
  hasCurrentContest,
  isAuthenticated,
  isOpen,
  onClose,
  onContestChange,
  onCreateRecord,
  onProblemSelected,
  onSelectRecord,
  onStatusChange,
  onTagsChange,
  onTitleChange,
  problem,
  relatedSolutions,
  saveState,
  selectedTags,
  status,
  title,
}: SolutionEditorSidebarProps) {
  const [isChangingProblem, setIsChangingProblem] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentContest = problem?.contests.find(
    (contest) => contest.contestId === contestId
  );
  const linkContestId = currentContest?.contestId ?? problem?.firstContest.id;
  const contestLabel = currentContest
    ? currentContest.contestId.toUpperCase()
    : 'コンテストを選ぶ';
  const canChooseContest =
    problem !== null && (problem.contests.length > 1 || !hasCurrentContest);
  const idleHint = getIdleHint({
    hasCurrentContest,
    hasProblemAndContest: Boolean(problem && contestId),
    isAuthenticated,
  });

  return (
    <aside
      aria-label="記録の設定"
      className={cn(
        'w-80 flex-shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white xl:static xl:flex xl:shadow-none',
        isOpen
          ? 'absolute inset-y-0 right-0 z-30 flex shadow-xl animate-in fade-in-0 duration-200'
          : 'hidden'
      )}
    >
      <div className="flex justify-end px-3 pt-3 xl:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-slate-500"
          onClick={onClose}
          aria-label="記録の設定を閉じる"
        >
          <X className="size-4" />
        </Button>
      </div>

      <section className="space-y-2 border-b border-slate-100 px-5 py-4">
        {problem ? (
          <>
            <div className="flex items-center justify-between gap-2 text-xs">
              {canChooseContest ? (
                <SolutionContestMenu
                  label={contestLabel}
                  contestId={contestId}
                  contests={problem.contests}
                  onContestChange={onContestChange}
                />
              ) : (
                <span className="min-w-0 truncate text-sm font-semibold text-slate-700">{contestLabel}</span>
              )}
              <SaveStatus saveState={saveState} />
            </div>
            <div className="flex items-start gap-1">
              {onProblemSelected && isChangingProblem ? (
                <div className="min-w-0 flex-1">
                  <ProblemInlineSearch
                    autoFocus
                    onSelectProblem={onProblemSelected}
                    onCancel={() => setIsChangingProblem(false)}
                    placeholder={
                      isAuthenticated ? '移す先の問題 ID / 問題名' : '問題 ID / 問題名'
                    }
                  />
                </div>
              ) : (
                <h1 className="min-w-0 flex-1 break-words text-lg font-bold leading-snug text-slate-900">
                  {currentContest?.problemIndex ?? problem.problemIndex} - {problem.name}
                </h1>
              )}
              {onProblemSelected && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-expanded={isChangingProblem}
                  aria-label={isChangingProblem ? '問題を変えるのをやめる' : '問題を変える'}
                  title={isChangingProblem ? 'やめる' : '問題を変える'}
                  onClick={() => setIsChangingProblem((value) => !value)}
                  className="size-7 shrink-0 text-slate-400 hover:text-slate-900"
                >
                  {isChangingProblem ? (
                    <X className="size-4" />
                  ) : (
                    <ArrowLeftRight className="size-4" />
                  )}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              {problem.difficulty !== null && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 font-medium',
                    getDifficultyColor(problem.difficulty)
                  )}
                >
                  <DifficultyCircle difficulty={problem.difficulty} />
                  {problem.difficulty}
                </span>
              )}
              <a
                href={`https://atcoder.jp/contests/${linkContestId}/tasks/${problem.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                <ExternalLink className="size-3.5" />
                AtCoderで開く
              </a>
            </div>
          </>
        ) : onProblemSelected ? (
          <ProblemInlineSearch
            onSelectProblem={onProblemSelected}
            title="記録する問題を選ぶ"
            description="問題名か問題 ID を入れると、候補が出ます。"
          />
        ) : (
          <p className="text-sm text-slate-500">問題を選んでください。</p>
        )}
      </section>

      {problem && (
        <section className="space-y-2 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <p className={SECTION_LABEL_CLASS_NAME}>この問題の記録</p>
            {contestId && (
              <button
                type="button"
                onClick={onCreateRecord}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="size-3.5" />
                新しい記録
              </button>
            )}
          </div>

          {relatedSolutions.length > 0 ? (
            <div className="space-y-1.5">
              {relatedSolutions.map((record, index) => {
                const isActive = record.id === activeSolutionId;
                const shownRecord = isActive ? { ...record, title, status } : record;
                const statusOption = getSolutionStatusOption(shownRecord.status);
                return (
                  <button
                    key={record.id}
                    type="button"
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => onSelectRecord(record.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                      isActive
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <span className="min-w-0 truncate">
                      {formatSolutionRecordLabel(shownRecord, index)}
                    </span>
                    {statusOption && (
                      <span className={cn('shrink-0 text-xs', statusOption.textClassName)}>
                        {statusOption.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              {contestId
                ? 'この問題の記録はまだありません。'
                : '上でコンテストを選ぶと表示されます。'}
            </p>
          )}
        </section>
      )}

      <section className="space-y-4 px-5 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="solution-title" className={SECTION_LABEL_CLASS_NAME}>
            タイトル
          </Label>
          <Input
            id="solution-title"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            maxLength={120}
            placeholder="本番AC解法 / 別解 / 復習用"
            className="border-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <p className={SECTION_LABEL_CLASS_NAME}>ステータス</p>
          <SolutionStatusPicker status={status} onStatusChange={onStatusChange} />
        </div>

        <SolutionTagSelector
          availableTags={availableTags}
          selectedTags={selectedTags}
          onSelectedTagsChange={onTagsChange}
        />

        {saveState === 'idle' && idleHint && (
          <p className="text-xs text-slate-400">{idleHint}</p>
        )}
      </section>
    </aside>
  );
}

function SaveStatus({ saveState }: { saveState: SolutionSaveState }) {
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

function getIdleHint({
  hasCurrentContest,
  hasProblemAndContest,
  isAuthenticated,
}: {
  hasCurrentContest: boolean;
  hasProblemAndContest: boolean;
  isAuthenticated: boolean;
}): string | null {
  if (!isAuthenticated) {
    return 'ログインすると、記録を保存できます。';
  }
  if (!hasProblemAndContest) {
    return '問題とコンテストを選ぶと、保存されます。';
  }
  if (!hasCurrentContest) {
    return 'この問題が入っているコンテストを選んでください。';
  }
  return null;
}
