'use client';

import { CheckCircle2, Loader2, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProblemInlineSearch from '@/features/solutions/components/ProblemInlineSearch';
import SolutionTagSelector from '@/features/solutions/components/SolutionTagSelector';
import { formatSolutionRecordLabel } from '@/features/solutions/functions/solution-editor';
import type {
  ProblemDetail,
  ProblemSearchResult,
  SelectableTag,
} from '@/features/problems/types';
import type {
  SolutionRecordListItem,
  SolutionSaveState,
  SolutionStatus,
} from '@/features/solutions/types';
import { getDifficultyColor } from '@/lib/atcoder/difficulty';

interface SolutionEditorSidebarProps {
  activeSolutionId: string | null;
  availableTags: SelectableTag[];
  contestId: string | null;
  hasCurrentContest: boolean;
  isAuthenticated: boolean;
  onContestChange: (contestId: string) => void;
  onCreateRecord: () => void;
  onProblemSelected?: (problemId: string) => void;
  onSelectRecord: (solutionId: string) => void;
  onStatusChange: (status: SolutionStatus) => void;
  onTagsChange: (tags: string[]) => void;
  onTitleChange: (title: string) => void;
  problem: ProblemDetail | null;
  problemSearchQuery: string;
  problemSearchResults: ProblemSearchResult[];
  relatedSolutions: SolutionRecordListItem[];
  saveState: SolutionSaveState;
  selectedTags: string[];
  status: SolutionStatus;
  title: string;
}

export default function SolutionEditorSidebar({
  activeSolutionId,
  availableTags,
  contestId,
  hasCurrentContest,
  isAuthenticated,
  onContestChange,
  onCreateRecord,
  onProblemSelected,
  onSelectRecord,
  onStatusChange,
  onTagsChange,
  onTitleChange,
  problem,
  problemSearchQuery,
  problemSearchResults,
  relatedSolutions,
  saveState,
  selectedTags,
  status,
  title,
}: SolutionEditorSidebarProps) {
  return (
    <aside className="hidden w-80 flex-shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white xl:flex">
      {problem ? (
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {contestId ?? problem.firstContest.id}
            </span>
            {problem.difficulty !== null && (
              <span
                className={`text-xs font-bold ${getDifficultyColor(problem.difficulty)}`}
              >
                Diff: {problem.difficulty}
              </span>
            )}
          </div>
          <h1 className="truncate text-2xl font-extrabold leading-tight text-slate-900">
            {problem.name}
          </h1>
        </div>
      ) : (
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          {onProblemSelected ? (
            <ProblemInlineSearch
              onSelectProblem={onProblemSelected}
              results={problemSearchResults}
              initialQuery={problemSearchQuery}
            />
          ) : (
            <p className="text-sm font-medium text-slate-500">
              問題を選択してください。
            </p>
          )}
        </div>
      )}

      {problem && onProblemSelected && (
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <ProblemInlineSearch
            onSelectProblem={onProblemSelected}
            results={problemSearchResults}
            initialQuery={problemSearchQuery}
            title="問題を切り替え"
            description={
              isAuthenticated
                ? '現在の解法記録を別の問題に移動できます。変更は自動保存されます。'
                : '問題を切り替えて編集できます。ログイン後に保存できます。'
            }
            placeholder="移動先の問題 ID / 問題名"
          />
        </div>
      )}

      <div className="space-y-2 border-b border-slate-100 px-5 py-5 text-left sm:px-6">
        <Label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          タイトル
        </Label>
        <Input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={120}
          placeholder="例: 本番AC解法 / 別解 / 復習用"
          className="rounded-xl border-slate-200"
        />
      </div>

      <div className="space-y-2 border-b border-slate-100 px-5 py-5 text-left sm:px-6">
        <Label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          コンテスト
        </Label>
        <Select
          value={contestId ?? undefined}
          onValueChange={onContestChange}
          disabled={!problem}
        >
          <SelectTrigger className="h-auto w-full rounded-xl border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-900 shadow-none transition-all focus:ring-2 focus:ring-slate-200">
            <SelectValue placeholder="コンテストを選択" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl">
            {problem?.contests.map((contest) => (
              <SelectItem key={contest.contestId} value={contest.contestId}>
                {contest.contestId.toUpperCase()} / {contest.problemIndex}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!activeSolutionId && problem && problem.contests.length > 1 && !contestId && (
          <p className="px-1 text-xs text-slate-400">
            どのコンテストで記録するか選択してください。
          </p>
        )}
      </div>

      <div className="space-y-2 border-b border-slate-100 px-5 py-5 text-left sm:px-6">
        <div className="flex items-center justify-between">
          <Label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            解法記録
          </Label>
          {contestId && problem && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg"
              onClick={onCreateRecord}
            >
              <Plus className="size-4" />
              <span>新規</span>
            </Button>
          )}
        </div>

        {relatedSolutions.length > 0 ? (
          <div className="space-y-2">
            {relatedSolutions.map((record, index) => (
              <button
                key={record.id}
                type="button"
                onClick={() => onSelectRecord(record.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                  record.id === activeSolutionId
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {formatSolutionRecordLabel(record, index)}
                  </div>
                  {!record.title?.trim() && (
                    <div
                      className={`text-xs ${
                        record.id === activeSolutionId
                          ? 'text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      タイトル未設定
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="px-1 text-xs text-slate-400">
            {problem && contestId
              ? 'この問題・コンテストの解法記録はまだありません。'
              : '問題とコンテストを選択すると表示されます。'}
          </p>
        )}
      </div>

      <div className="space-y-2 border-b border-slate-100 px-5 py-5 text-left sm:px-6">
        <Label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          ステータス
        </Label>
        <div className="relative">
          <Select
            value={status}
            onValueChange={(value) => onStatusChange(value as SolutionStatus)}
          >
            <SelectTrigger className="h-auto w-full rounded-xl border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm font-medium text-slate-900 shadow-none transition-all focus:ring-2 focus:ring-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="AC" className="font-semibold text-emerald-600">
                Accepted (AC)
              </SelectItem>
              <SelectItem value="SELF_AC" className="font-semibold text-amber-600">
                Self AC
              </SelectItem>
              <SelectItem value="EXPLANATION_AC" className="font-semibold text-blue-600">
                Editorial AC
              </SelectItem>
              <SelectItem value="REVIEW_AC" className="font-semibold text-purple-600">
                Reviewing
              </SelectItem>
              <SelectItem value="TRYING" className="font-semibold text-slate-600">
                Trying
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">
            <CheckCircle2 className="h-4 w-4 fill-current opacity-80" />
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <SolutionTagSelector
          availableTags={availableTags}
          selectedTags={selectedTags}
          onSelectedTagsChange={onTagsChange}
        />
      </div>

      <div className="flex min-h-12 items-center justify-center gap-2 px-5 py-4 text-sm sm:px-6">
        {saveState === 'saving' && (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            <span className="text-slate-400">保存中...</span>
          </>
        )}
        {saveState === 'saved' && (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-emerald-600">保存済み</span>
          </>
        )}
        {saveState === 'error' && (
          <>
            <X className="h-4 w-4 text-red-500" />
            <span className="text-red-600">保存エラー</span>
          </>
        )}
        {saveState === 'idle' && !isAuthenticated && (
          <span className="text-xs text-slate-300">
            ログインすると解法記録を保存できます
          </span>
        )}
        {saveState === 'idle' && isAuthenticated && (!problem || !contestId) && (
          <span className="text-xs text-slate-300">
            問題とコンテストを選択してください
          </span>
        )}
        {saveState === 'idle' && isAuthenticated && problem && contestId && !hasCurrentContest && (
          <span className="text-xs text-slate-300">
            有効なコンテストを選択してください
          </span>
        )}
      </div>
    </aside>
  );
}
