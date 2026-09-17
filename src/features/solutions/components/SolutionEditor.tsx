'use client';

import {
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
import {
  getDefaultContestId,
  getSolutionEditorKey,
} from '@/features/solutions/functions/solution-editor';
import { useHydrated } from '@/features/solutions/hooks/use-hydrated';
import { useDebounce } from '@/hooks/use-debounce';
import type {
  ProblemDetail,
  ProblemSearchResult,
  SelectableTag,
} from '@/features/problems/types';
import type {
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
    value: initialSolution?.content
      ? JSON.parse(initialSolution.content)
      : draftState?.content
        ? JSON.parse(draftState.content)
        : [{ type: 'p', children: [{ text: '' }] }],
  });

  useEffect(() => {
    isNavigatingRef.current = false;
    savedScopeRef.current = initialSolution
      ? {
          problemId: initialSolution.problemId,
          contestId: initialSolution.contestId,
        }
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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!shouldSaveInitialDraft) return;
    }
    if (
      !isAuthenticated ||
      !problem?.id ||
      !debouncedContestId ||
      !isDebouncedContestValid
    ) {
      return;
    }
    const problemId = problem.id;
    const targetContestId = debouncedContestId;

    async function performSave() {
      setSaveState('saving');
      try {
        const result = await saveSolution({
          solutionId: savedSolutionId,
          problemId,
          contestId: targetContestId,
          title: debouncedTitle || null,
          content: debouncedContent,
          status: debouncedStatus,
          tagNames: JSON.parse(debouncedTagsKey) as string[],
        });
        if (!result.ok) {
          setSaveState('error');
          return;
        }

        const savedId = result.value.solutionId;
        const previousScope = savedScopeRef.current;
        const nextScope = {
          problemId,
          contestId: targetContestId,
        };
        const didMoveScope = Boolean(
          previousScope &&
            (previousScope.problemId !== nextScope.problemId ||
              previousScope.contestId !== nextScope.contestId)
        );

        setSavedSolutionId(savedId);
        setSaveState('saved');
        savedScopeRef.current = nextScope;

        if (
          (!savedSolutionId || savedId !== savedSolutionId) &&
          !isNavigatingRef.current
        ) {
          router.replace(`/solutions/${savedId}`);
          router.refresh();
        } else if (didMoveScope && !isNavigatingRef.current) {
          router.refresh();
        }
      } catch {
        setSaveState('error');
      }
    }

    void performSave();
  }, [
    debouncedContent,
    debouncedContestId,
    debouncedStatus,
    debouncedTagsKey,
    debouncedTitle,
    isAuthenticated,
    isDebouncedContestValid,
    problem?.id,
    router,
    savedSolutionId,
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
    router.push(`/solutions/new?problemId=${problem.id}`);
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
            className="mx-auto flex h-full min-h-0 max-w-3xl cursor-text flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            {!mounted ? (
              <div className="animate-pulse space-y-6">
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
                    className="min-h-full max-w-none p-0 pb-32 text-base leading-relaxed text-slate-700 prose prose-slate"
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
