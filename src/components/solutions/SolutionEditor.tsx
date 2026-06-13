'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Plus, X } from 'lucide-react';
import { Plate, usePlateEditor } from 'platejs/react';
import { SolutionStatus } from '@prisma/client';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { EditorKit } from '@/components/editor/editor-kit';
import ProblemInlineSearch from '@/components/solutions/ProblemInlineSearch';
import SolutionTagSelector from '@/components/solutions/SolutionTagSelector';
import { saveSolution, getSolutionRecordsAction } from '@/lib/actions/solution';
import { getDifficultyColor } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import type {
  ProblemDetail,
  SolutionRecordListItem,
  SolutionWithTags,
} from '@/lib/services/db/solution';
import type { AvailableTag } from '@/lib/services/db/tag';

import 'katex/dist/katex.min.css';

const DEFAULT_CONTENT = JSON.stringify([{ type: 'p', children: [{ text: '' }] }]);
const DEFAULT_STATUS: SolutionStatus = 'AC';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface SolutionDraftState {
  title: string;
  content: string;
  status: SolutionStatus;
  tags: string[];
  contestId: string | null;
}

interface SolutionEditorProps {
  problem: ProblemDetail | null;
  initialSolution: SolutionWithTags | null;
  initialContestId: string | null;
  relatedSolutions: SolutionRecordListItem[];
  availableTags: AvailableTag[];
  draftState?: SolutionDraftState;
  onDraftChange?: (draftState: SolutionDraftState) => void;
  onProblemSelected?: (problemId: string) => void;
  onRelatedSolutionsChange?: (solutions: SolutionRecordListItem[]) => void;
  onSelectSolution?: (solutionId: string) => void;
}

function getDefaultContestId(problem: ProblemDetail | null, initialContestId: string | null): string | null {
  if (!problem) {
    return null;
  }

  if (initialContestId && problem.contests.some((contest) => contest.contestId === initialContestId)) {
    return initialContestId;
  }

  if (problem.contests.some((contest) => contest.contestId === problem.firstContest.id)) {
    return problem.firstContest.id;
  }

  return problem.contests[0]?.contestId ?? null;
}

function formatSolutionRecordLabel(record: SolutionRecordListItem, index: number): string {
  return record.title?.trim() || `記録 ${index + 1}`;
}

function subscribeHydration(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

function useHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  );
}

function getSolutionEditorKey({
  initialContestId,
  initialSolution,
  problem,
}: SolutionEditorProps): string {
  return [
    initialSolution?.id ?? 'new',
    problem?.id ?? 'no-problem',
    initialContestId ?? 'no-contest',
  ].join(':');
}

export default function SolutionEditor(props: SolutionEditorProps) {
  return <SolutionEditorContent key={getSolutionEditorKey(props)} {...props} />;
}

function SolutionEditorContent({
  problem,
  initialSolution,
  initialContestId,
  relatedSolutions,
  availableTags,
  draftState,
  onDraftChange,
  onProblemSelected,
  onRelatedSolutionsChange,
  onSelectSolution,
}: SolutionEditorProps) {
  const router = useRouter();
  const mounted = useHydrated();
  const [title, setTitle] = useState<string>(initialSolution?.title ?? draftState?.title ?? '');
  const [status, setStatus] = useState<SolutionStatus>(initialSolution?.status || draftState?.status || DEFAULT_STATUS);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialSolution?.userTags.map((tag) => tag.userTag.name) || draftState?.tags || []
  );
  const [editorContent, setEditorContent] = useState<string>(
    initialSolution?.content ?? draftState?.content ?? DEFAULT_CONTENT
  );
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedSolutionId, setSavedSolutionId] = useState<string | null>(initialSolution?.id ?? null);
  const [contestId, setContestId] = useState<string | null>(
    initialSolution?.contestId ??
      draftState?.contestId ??
      getDefaultContestId(problem, initialContestId)
  );
  const isFirstRender = useRef(true);
  const isNavigatingRef = useRef(false);
  const savedScopeRef = useRef<{ problemId: string; contestId: string } | null>(
    initialSolution
      ? { problemId: initialSolution.problemId, contestId: initialSolution.contestId }
      : null
  );

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialSolution?.content
      ? JSON.parse(initialSolution.content)
      : draftState?.content
        ? JSON.parse(draftState.content)
        : [{ type: 'p', children: [{ text: '' }] }],
  });

  useEffect(() => {
    isNavigatingRef.current = false;
    savedScopeRef.current = initialSolution
      ? { problemId: initialSolution.problemId, contestId: initialSolution.contestId }
      : null;
  }, [initialSolution]);

  const debouncedContent = useDebounce(editorContent, 1000);
  const debouncedTitle = useDebounce(title.trim(), 300);
  const debouncedStatus = useDebounce(status, 300);
  const debouncedContestId = useDebounce(contestId, 300);
  const debouncedTagsKey = useDebounce(JSON.stringify(selectedTags), 300);
  const shouldSaveInitialDraft = Boolean(
    problem?.id &&
      contestId &&
      !initialSolution &&
      draftState &&
      (
        draftState.content !== DEFAULT_CONTENT ||
        draftState.title.trim().length > 0 ||
        draftState.status !== DEFAULT_STATUS ||
        draftState.tags.length > 0
      )
  );

  const currentContest = useMemo(
    () => problem?.contests.find((contest) => contest.contestId === contestId) ?? null,
    [contestId, problem]
  );
  const isDebouncedContestValid = useMemo(
    () => Boolean(problem?.contests.some((contest) => contest.contestId === debouncedContestId)),
    [debouncedContestId, problem]
  );
  const activeSolutionId = initialSolution?.id ?? savedSolutionId;

  useEffect(() => {
    if (problem?.id) {
      return;
    }

    onDraftChange?.({
      content: editorContent,
      title,
      status,
      tags: selectedTags,
      contestId,
    });
  }, [contestId, editorContent, onDraftChange, problem?.id, selectedTags, status, title]);

  useEffect(() => {
    if (!problem?.id || !contestId) {
      onRelatedSolutionsChange?.([]);
      return;
    }

    let isActive = true;

    const fetchRelatedSolutions = async () => {
      try {
        const records = await getSolutionRecordsAction(problem.id, contestId);
        if (isActive) {
          onRelatedSolutionsChange?.(records);
        }
      } catch {
        if (isActive) {
          onRelatedSolutionsChange?.([]);
        }
      }
    };

    fetchRelatedSolutions();

    return () => {
      isActive = false;
    };
  }, [contestId, onRelatedSolutionsChange, problem?.id]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!shouldSaveInitialDraft) {
        return;
      }
    }

    if (!problem?.id || !debouncedContestId || !isDebouncedContestValid) {
      return;
    }

    const performSave = async () => {
      setSaveState('saving');

      try {
        const tagNames = JSON.parse(debouncedTagsKey) as string[];
        const result = await saveSolution(
          savedSolutionId,
          problem.id,
          debouncedContestId,
          debouncedTitle || null,
          debouncedContent,
          debouncedStatus,
          tagNames
        );

        setSavedSolutionId(result.solutionId);
        setSaveState('saved');

        const previousScope = savedScopeRef.current;
        const nextScope = { problemId: problem.id, contestId: debouncedContestId };
        const didMoveScope = Boolean(
          previousScope &&
            (
              previousScope.problemId !== nextScope.problemId ||
              previousScope.contestId !== nextScope.contestId
            )
        );
        savedScopeRef.current = nextScope;

        if ((!savedSolutionId || result.solutionId !== savedSolutionId) && !isNavigatingRef.current) {
          router.replace(`/solutions/${result.solutionId}`);
          router.refresh();
        } else if (didMoveScope && !isNavigatingRef.current) {
          router.refresh();
        }
      } catch {
        setSaveState('error');
      }
    };

    performSave();
  }, [
    debouncedContent,
    debouncedTitle,
    debouncedContestId,
    debouncedStatus,
    debouncedTagsKey,
    problem?.id,
    isDebouncedContestValid,
    router,
    savedSolutionId,
    shouldSaveInitialDraft,
  ]);

  const handleEditorSurfaceMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest('[data-slate-editor="true"], [contenteditable="true"]')) {
      return;
    }

    event.preventDefault();
    editor.tf.focus({ edge: 'endEditor' });
  };

  const handleCreateNewRecord = () => {
    if (!problem) {
      return;
    }

    isNavigatingRef.current = true;
    router.push(`/solutions/new?problemId=${problem.id}`);
  };

  const handleSelectSolutionRecord = (solutionId: string) => {
    isNavigatingRef.current = true;
    onSelectSolution?.(solutionId);
  };

  return (
    <div className="flex h-full min-h-0 w-full bg-slate-50">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
          <div
            onMouseDown={handleEditorSurfaceMouseDown}
            className="mx-auto flex h-full min-h-0 max-w-3xl cursor-text flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            {!mounted ? (
              <div className="animate-pulse space-y-6">
                <div className="h-4 w-full rounded bg-slate-50" />
                <div className="h-4 w-5/6 rounded bg-slate-50" />
                <div className="h-4 w-4/6 rounded bg-slate-50" />
              </div>
            ) : (
              <Plate editor={editor} onChange={({ value }) => setEditorContent(JSON.stringify(value))}>
                <EditorContainer className="min-h-0 flex-1 overflow-x-auto overflow-y-auto border-none p-0 shadow-none">
                  <Editor
                    variant="none"
                    className="min-h-full max-w-none p-0 pb-32 text-base leading-relaxed text-slate-700 prose prose-slate"
                  />
                </EditorContainer>
              </Plate>
            )}
          </div>
        </div>
      </div>

      <aside className="hidden w-80 flex-shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white xl:flex">
        {problem ? (
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {contestId ?? problem.firstContest.id}
              </span>
              {problem.difficulty !== null && (
                <span className={`text-xs font-bold ${getDifficultyColor(problem.difficulty)}`}>
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
              <ProblemInlineSearch onSelectProblem={onProblemSelected} />
            ) : (
              <p className="text-sm font-medium text-slate-500">問題を選択してください。</p>
            )}
          </div>
        )}

        {problem && onProblemSelected && (
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <ProblemInlineSearch
              onSelectProblem={onProblemSelected}
              title="問題を切り替え"
              description="現在の解法記録を別の問題に移動できます。変更は自動保存されます。"
              placeholder="移動先の問題 ID / 問題名"
            />
          </div>
        )}

        <div className="space-y-2 border-b border-slate-100 px-5 py-5 text-left sm:px-6">
          <Label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">タイトル</Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="例: 本番AC解法 / 別解 / 復習用"
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2 border-b border-slate-100 px-5 py-5 text-left sm:px-6">
          <Label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">コンテスト</Label>
          <Select
            value={contestId ?? undefined}
            onValueChange={setContestId}
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
          {!savedSolutionId && problem && problem.contests.length > 1 && !contestId && (
            <p className="px-1 text-xs text-slate-400">どのコンテストで記録するか選択してください。</p>
          )}
        </div>

        <div className="space-y-2 border-b border-slate-100 px-5 py-5 text-left sm:px-6">
          <div className="flex items-center justify-between">
            <Label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">解法記録</Label>
            {contestId && problem && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg"
                onClick={handleCreateNewRecord}
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
                  onClick={() => handleSelectSolutionRecord(record.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                    record.id === activeSolutionId
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{formatSolutionRecordLabel(record, index)}</div>
                    {!record.title?.trim() && (
                      <div className={`text-xs ${record.id === activeSolutionId ? 'text-slate-300' : 'text-slate-400'}`}>
                        タイトル未設定
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-1 text-xs text-slate-400">
              {problem && contestId ? 'この問題・コンテストの解法記録はまだありません。' : '問題とコンテストを選択すると表示されます。'}
            </p>
          )}
        </div>

        <div className="space-y-2 border-b border-slate-100 px-5 py-5 text-left sm:px-6">
          <Label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">ステータス</Label>
          <div className="relative">
            <Select value={status} onValueChange={(value) => setStatus(value as SolutionStatus)}>
              <SelectTrigger className="h-auto w-full rounded-xl border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm font-medium text-slate-900 shadow-none transition-all focus:ring-2 focus:ring-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="AC" className="font-semibold text-emerald-600">Accepted (AC)</SelectItem>
                <SelectItem value="SELF_AC" className="font-semibold text-amber-600">Self AC</SelectItem>
                <SelectItem value="EXPLANATION_AC" className="font-semibold text-blue-600">Editorial AC</SelectItem>
                <SelectItem value="REVIEW_AC" className="font-semibold text-purple-600">Reviewing</SelectItem>
                <SelectItem value="TRYING" className="font-semibold text-slate-600">Trying</SelectItem>
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
            onSelectedTagsChange={setSelectedTags}
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
          {saveState === 'idle' && (!problem || !contestId) && (
            <span className="text-xs text-slate-300">問題とコンテストを選択してください</span>
          )}
          {saveState === 'idle' && problem && contestId && !currentContest && (
            <span className="text-xs text-slate-300">有効なコンテストを選択してください</span>
          )}
        </div>
      </aside>
    </div>
  );
}
