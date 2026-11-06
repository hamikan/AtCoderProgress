'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { saveSolution } from '@/features/solutions/actions/save-solution';
import SolutionEditorSidebar from '@/features/solutions/components/SolutionEditorSidebar';
import { isEmptySolutionContent } from '@/features/solutions/functions/solution-content';
import {
  buildSaveSignature,
  getUnflushedPayload,
} from '@/features/solutions/functions/save-signature';
import {
  getDefaultContestId,
  getSolutionEditorKey,
  hasUnsavedScopeMove,
} from '@/features/solutions/functions/solution-editor';
import { useHydrated } from '@/features/solutions/hooks/use-hydrated';
import { useDebounce } from '@/hooks/use-debounce';
import type {
  ProblemDetail,
  ProblemSearchResult,
  SelectableTag,
} from '@/features/problems/types';
import type {
  SavePayload,
  SaveSolutionInput,
  SolutionDraftState,
  SolutionRecordListItem,
  SolutionSaveState,
  SolutionStatus,
  SolutionWithTags,
} from '@/features/solutions/types';

import 'katex/dist/katex.min.css';

const DEFAULT_CONTENT = JSON.stringify([
  { type: 'p', children: [{ text: '' }] },
]);
const DEFAULT_STATUS: SolutionStatus = 'AC';

interface SolutionEditorProps {
  problem: ProblemDetail | null;
  initialSolution: SolutionWithTags | null;
  initialContestId: string | null;
  relatedSolutions: SolutionRecordListItem[];
  availableTags: SelectableTag[];
  draftState?: SolutionDraftState;
  onDraftChange?: (draftState: SolutionDraftState) => void;
  onProblemSelected?: (problemId: string) => void;
  onSelectSolution?: (solutionId: string) => void;
  problemSearchQuery: string;
  problemSearchResults: ProblemSearchResult[];
  isAuthenticated: boolean;
  notice?: ReactNode;
}

export default function SolutionEditor(props: SolutionEditorProps) {
  const key = getSolutionEditorKey({
    solutionId: props.initialSolution?.id ?? null,
    problemId: props.problem?.id ?? null,
    contestId: props.initialContestId,
  });
  return <SolutionEditorContent key={key} {...props} />;
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
  onSelectSolution,
  problemSearchQuery,
  problemSearchResults,
  isAuthenticated,
  notice,
}: SolutionEditorProps) {
  const router = useRouter();
  const mounted = useHydrated();
  const [title, setTitle] = useState(
    initialSolution?.title ?? draftState?.title ?? ''
  );
  const [status, setStatus] = useState<SolutionStatus>(
    initialSolution?.status ?? draftState?.status ?? DEFAULT_STATUS
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialSolution?.userTags.map((tag) => tag.userTag.name) ??
      draftState?.tags ??
      []
  );
  const [editorContent, setEditorContent] = useState(
    initialSolution?.content ?? draftState?.content ?? DEFAULT_CONTENT
  );
  const [saveState, setSaveState] = useState<SolutionSaveState>('idle');
  const [savedSolutionId, setSavedSolutionId] = useState<string | null>(
    initialSolution?.id ?? null
  );
  const [contestId, setContestId] = useState<string | null>(
    initialSolution?.contestId ??
      draftState?.contestId ??
      getDefaultContestId(problem, initialContestId)
  );
  const isFirstRender = useRef(true);
  const isNavigatingRef = useRef(false);
  // 最初の保存で作られた記録の ID を次の保存に使い、記録が二重にできないよう、保存は1つずつ送る
  const savedSolutionIdRef = useRef<string | null>(
    initialSolution?.id ?? null
  );
  // 保存が終わる前に別の画面へ移ったとき、移った先の URL を書き換えたり読み直したりしないため
  const isMountedRef = useRef(true);
  const saveInFlightRef = useRef(false);
  const pendingSaveRef = useRef<SaveSolutionInput | null>(null);
  // 保存側が引き受け済みの最新ペイロードの控えと、入力途中の値の控え。画面を離れるときにデバウンス待ちの入力を流すために使う
  const lastHandledSignatureRef = useRef<string | null>(null);
  const latestSnapshotRef = useRef<{
    payload: SavePayload;
    isContestValid: boolean;
    isAuthenticated: boolean;
  } | null>(null);
  const flushPendingSaveRef = useRef<() => void>(() => {});
  const savedScopeRef = useRef<{
    problemId: string;
    contestId: string;
  } | null>(
    initialSolution
      ? {
          problemId: initialSolution.problemId,
          contestId: initialSolution.contestId,
        }
      : null
  );

  const editor = usePlateEditor({
    plugins: EditorKit,
    shouldNormalizeEditor: true,
    value: initialSolution?.content
      ? JSON.parse(initialSolution.content)
      : draftState?.content
        ? JSON.parse(draftState.content)
        : [{ type: 'p', children: [{ text: '' }] }],
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    isNavigatingRef.current = false;
    savedSolutionIdRef.current = initialSolution?.id ?? null;
    savedScopeRef.current = initialSolution
      ? {
          problemId: initialSolution.problemId,
          contestId: initialSolution.contestId,
        }
      : null;
    lastHandledSignatureRef.current = initialSolution
      ? buildSaveSignature({
          problemId: initialSolution.problemId,
          contestId: initialSolution.contestId,
          title: initialSolution.title,
          content: initialSolution.content ?? DEFAULT_CONTENT,
          status: initialSolution.status,
          tagNames: initialSolution.userTags.map((tag) => tag.userTag.name),
        })
      : null;
  }, [initialSolution]);

  const debouncedContent = useDebounce(editorContent, 1000);
  const debouncedTitle = useDebounce(title.trim(), 300);
  const debouncedStatus = useDebounce(status, 300);
  const debouncedContestId = useDebounce(contestId, 300);
  const debouncedTagsKey = useDebounce(JSON.stringify(selectedTags), 300);
  // 同じコンテストの別の問題へ切り替えても入力は何も変わらず保存が走らないため、記録と範囲がずれていれば開いた直後に保存する
  const hasScopeMove = hasUnsavedScopeMove(
    initialSolution
      ? {
          problemId: initialSolution.problemId,
          contestId: initialSolution.contestId,
        }
      : null,
    problem && contestId
      ? { problemId: problem.id, contestId }
      : null
  );
  const shouldSaveInitialDraft = Boolean(
    problem?.id &&
      contestId &&
      !initialSolution &&
      draftState &&
      (draftState.content !== DEFAULT_CONTENT ||
        draftState.title.trim().length > 0 ||
        draftState.status !== DEFAULT_STATUS ||
        draftState.tags.length > 0)
  );
  const currentContest = useMemo(
    () =>
      problem?.contests.find((contest) => contest.contestId === contestId) ??
      null,
    [contestId, problem]
  );
  const isDebouncedContestValid = useMemo(
    () =>
      Boolean(
        problem?.contests.some(
          (contest) => contest.contestId === debouncedContestId
        )
      ),
    [debouncedContestId, problem]
  );
  const activeSolutionId = initialSolution?.id ?? savedSolutionId;
  const visibleRelatedSolutions = useMemo(
    () =>
      relatedSolutions.filter((solution) => solution.contestId === contestId),
    [contestId, relatedSolutions]
  );

  useEffect(() => {
    if (problem?.id) return;

    onDraftChange?.({
      content: editorContent,
      title,
      status,
      tags: selectedTags,
      contestId,
    });
  }, [
    contestId,
    editorContent,
    onDraftChange,
    problem?.id,
    selectedTags,
    status,
    title,
  ]);

  useEffect(() => {
    latestSnapshotRef.current =
      problem && contestId
        ? {
            payload: {
              problemId: problem.id,
              contestId,
              title: title.trim() || null,
              content: editorContent,
              status,
              tagNames: selectedTags,
            },
            isContestValid: problem.contests.some(
              (contest) => contest.contestId === contestId
            ),
            isAuthenticated,
          }
        : null;
  }, [
    contestId,
    editorContent,
    isAuthenticated,
    problem,
    selectedTags,
    status,
    title,
  ]);

  const drainSaveQueue = useCallback(async () => {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    try {
      while (pendingSaveRef.current) {
        const input = {
          ...pendingSaveRef.current,
          solutionId: savedSolutionIdRef.current,
        };
        pendingSaveRef.current = null;
        setSaveState('saving');
        try {
          const result = await saveSolution(input);
          if (!result.ok) {
            setSaveState('error');
            return;
          }

          const savedId = result.value.solutionId;
          const isFirstSave = savedSolutionIdRef.current === null;
          savedSolutionIdRef.current = savedId;
          setSavedSolutionId(savedId);
          setSaveState('saved');

          const previousScope = savedScopeRef.current;
          const nextScope = {
            problemId: input.problemId,
            contestId: input.contestId,
          };
          const didMoveScope = Boolean(
            previousScope &&
              (previousScope.problemId !== nextScope.problemId ||
                previousScope.contestId !== nextScope.contestId)
          );
          savedScopeRef.current = nextScope;

          if (
            isFirstSave &&
            !isNavigatingRef.current &&
            isMountedRef.current
          ) {
            // ページを移るとエディタが作り直されて保存中に打った文字が消えるため、URL だけを書き換える
            window.history.replaceState(null, '', `/solutions/${savedId}`);
          } else if (
            didMoveScope &&
            !isNavigatingRef.current &&
            isMountedRef.current
          ) {
            router.refresh();
          }
        } catch {
          setSaveState('error');
          return;
        }
      }
    } finally {
      saveInFlightRef.current = false;
    }
  }, [router]);

  function flushPendingSave() {
    const snapshot = latestSnapshotRef.current;
    if (!snapshot || !snapshot.isAuthenticated || !snapshot.isContestValid) {
      return;
    }
    const { payload } = snapshot;
    // デバウンス保存と同じ、空の記録を作らないための条件
    if (
      savedSolutionIdRef.current === null &&
      isEmptySolutionContent(payload.content) &&
      payload.title === null &&
      payload.status === DEFAULT_STATUS &&
      payload.tagNames.length === 0
    ) {
      return;
    }
    const unflushed = getUnflushedPayload(
      payload,
      lastHandledSignatureRef.current
    );
    if (!unflushed) {
      return;
    }
    lastHandledSignatureRef.current = buildSaveSignature(unflushed);
    pendingSaveRef.current = {
      ...unflushed,
      solutionId: savedSolutionIdRef.current,
    };
    void drainSaveQueue();
  }

  useEffect(() => {
    flushPendingSaveRef.current = flushPendingSave;
  });

  // デバウンス待ちの間に画面を離れると直前の入力が落ちるため、離脱時に同じ保存キューへ流す（タブを閉じる場合はベストエフォート）
  useEffect(() => {
    const handlePageHide = () => {
      flushPendingSaveRef.current();
    };
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      flushPendingSaveRef.current();
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!shouldSaveInitialDraft && !hasScopeMove) return;
    }
    if (
      !isAuthenticated ||
      !problem?.id ||
      !debouncedContestId ||
      !isDebouncedContestValid
    ) {
      return;
    }
    // 開いたりクリックしたりしただけで空の記録ができないよう、何か書かれるまでは記録を作らない
    if (
      savedSolutionIdRef.current === null &&
      isEmptySolutionContent(debouncedContent) &&
      debouncedTitle === '' &&
      debouncedStatus === DEFAULT_STATUS &&
      debouncedTagsKey === '[]'
    ) {
      return;
    }

    const payload: SavePayload = {
      problemId: problem.id,
      contestId: debouncedContestId,
      title: debouncedTitle || null,
      content: debouncedContent,
      status: debouncedStatus,
      tagNames: JSON.parse(debouncedTagsKey) as string[],
    };
    pendingSaveRef.current = {
      ...payload,
      solutionId: savedSolutionIdRef.current,
    };
    lastHandledSignatureRef.current = buildSaveSignature(payload);

    void drainSaveQueue();
  }, [
    debouncedContent,
    debouncedContestId,
    debouncedStatus,
    debouncedTagsKey,
    debouncedTitle,
    drainSaveQueue,
    hasScopeMove,
    isAuthenticated,
    isDebouncedContestValid,
    problem?.id,
    shouldSaveInitialDraft,
  ]);

  function handleEditorSurfaceMouseDown(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest('[data-slate-editor="true"], [contenteditable="true"]')) {
      return;
    }

    event.preventDefault();
    editor.tf.focus({ edge: 'endEditor' });
  }

  function handleCreateNewRecord() {
    if (!problem) return;
    isNavigatingRef.current = true;
    const searchParams = new URLSearchParams({ problemId: problem.id });
    if (contestId) {
      searchParams.set('contestId', contestId);
    }
    router.push(`/solutions/new?${searchParams}`);
  }

  function handleSelectSolutionRecord(solutionId: string) {
    isNavigatingRef.current = true;
    onSelectSolution?.(solutionId);
  }

  return (
    <div className="flex h-full min-h-0 w-full bg-slate-50">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {notice && (
          <div className="shrink-0 px-4 pt-4 sm:px-6">
            {notice}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
          <div
            onMouseDown={handleEditorSurfaceMouseDown}
            className="mx-auto flex h-full min-h-0 max-w-3xl cursor-text flex-col rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {!mounted ? (
              <div className="animate-pulse space-y-6 p-4 sm:p-6">
                <div className="h-4 w-full rounded bg-slate-50" />
                <div className="h-4 w-5/6 rounded bg-slate-50" />
                <div className="h-4 w-4/6 rounded bg-slate-50" />
              </div>
            ) : (
              <Plate
                editor={editor}
                onChange={({ value }) =>
                  setEditorContent(JSON.stringify(value))
                }
              >
                <EditorContainer className="min-h-0 flex-1 overflow-x-auto overflow-y-auto border-none p-0 shadow-none">
                  <Editor
                    variant="none"
                    className="min-h-full max-w-none px-4 pb-32 pt-4 text-base leading-relaxed text-slate-700 prose prose-slate sm:px-6 sm:pt-6"
                  />
                </EditorContainer>
              </Plate>
            )}
          </div>
        </div>
      </div>

      <SolutionEditorSidebar
        activeSolutionId={activeSolutionId}
        availableTags={availableTags}
        contestId={contestId}
        hasCurrentContest={Boolean(currentContest)}
        isAuthenticated={isAuthenticated}
        onContestChange={setContestId}
        onCreateRecord={handleCreateNewRecord}
        onProblemSelected={onProblemSelected}
        onSelectRecord={handleSelectSolutionRecord}
        onStatusChange={setStatus}
        onTagsChange={setSelectedTags}
        onTitleChange={setTitle}
        problem={problem}
        problemSearchQuery={problemSearchQuery}
        problemSearchResults={problemSearchResults}
        relatedSolutions={visibleRelatedSolutions}
        saveState={saveState}
        selectedTags={selectedTags}
        status={status}
        title={title}
      />
    </div>
  );
}
