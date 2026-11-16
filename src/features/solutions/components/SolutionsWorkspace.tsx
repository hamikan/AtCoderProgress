'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import SolutionsSidebar from '@/features/solutions/components/SolutionsSidebar';
import { useSolutionsSidebarState } from '@/features/solutions/components/SolutionsSidebarStateProvider';
import SolutionEditor from '@/features/solutions/components/SolutionEditor';
import { getProblemSwitchPath } from '@/features/solutions/functions/solution-editor';
import { DEFAULT_SOLUTION_STATUS } from '@/features/solutions/functions/solution-status';
import type {
  SolutionDraftState,
  SolutionListItem,
  SolutionRecordListItem,
  SolutionSidebarContestProblem,
  SolutionWithTags,
} from '@/features/solutions/types';
import type { ProblemDetail, SelectableTag } from '@/features/problems/types';

interface SolutionsWorkspaceProps {
  solutions: SolutionListItem[];
  contestProblems: SolutionSidebarContestProblem[];
  availableTags: SelectableTag[];
  initialProblem: ProblemDetail | null;
  initialSolution: SolutionWithTags | null;
  initialContestId: string | null;
  initialRelatedSolutions: SolutionRecordListItem[];
  isAuthenticated: boolean;
  notice?: ReactNode;
}

const DEFAULT_CONTENT = JSON.stringify([{ type: 'p', children: [{ text: '' }] }]);
const EMPTY_DRAFT_STATE: SolutionDraftState = {
  title: '',
  content: DEFAULT_CONTENT,
  status: DEFAULT_SOLUTION_STATUS,
  tags: [],
  contestId: null,
};

export default function SolutionsWorkspace({
  solutions,
  contestProblems,
  availableTags,
  initialProblem,
  initialSolution,
  initialContestId,
  initialRelatedSolutions,
  isAuthenticated,
  notice,
}: SolutionsWorkspaceProps) {
  const [draftState, setDraftState] = useState<SolutionDraftState>(EMPTY_DRAFT_STATE);
  // 新規の記録は、最初の保存のあとも URL を書き換えるだけで、画面に渡している initialSolution は空のまま。保存先の記録はここで覚えておく
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
  const [draftGeneration, setDraftGeneration] = useState(0);
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useSolutionsSidebarState();

  const handleSelectSolution = useCallback((solutionId: string) => {
    if (solutionId === initialSolution?.id) return;
    router.push(`/solutions/${solutionId}`);
  }, [initialSolution?.id, router]);

  const handleSelectProblem = useCallback((problemId: string) => {
    router.push(
      getProblemSwitchPath({ solutionId: initialSolution?.id ?? savedDraftId, problemId })
    );
  }, [initialSolution?.id, router, savedDraftId]);

  // 下書きを記録として保存し終えたら、下書きは消す。残しておくと、次の新規の記録に同じ文章が入ってしまう
  const handleDraftSaved = useCallback((solutionId: string) => {
    setSavedDraftId(solutionId);
    setDraftState(EMPTY_DRAFT_STATE);
  }, []);

  const openNewDraft = useCallback((searchParams?: URLSearchParams) => {
    if (savedDraftId !== null) {
      // 同じ URL へ移っても画面は作り直されず、保存済みの記録を書き続けてしまうので、番号を進めて作り直す
      setDraftGeneration((generation) => generation + 1);
      setSavedDraftId(null);
    }
    router.push(searchParams ? `/solutions/new?${searchParams}` : '/solutions/new');
  }, [router, savedDraftId]);

  const handleNewDraft = useCallback(() => {
    openNewDraft();
  }, [openNewDraft]);

  const handleNewDraftForProblem = useCallback((contestId: string, problemId: string) => {
    openNewDraft(new URLSearchParams({ contestId, problemId }));
  }, [openNewDraft]);

  const handleCreateRecord = useCallback((problemId: string, contestId: string | null) => {
    openNewDraft(new URLSearchParams({ problemId, ...(contestId ? { contestId } : {}) }));
  }, [openNewDraft]);

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      className="h-full !min-h-0"
    >

      <SolutionsSidebar
        solutions={solutions}
        contestProblems={contestProblems}
        selectedSolutionId={initialSolution?.id ?? null}
        onSelectSolution={handleSelectSolution}
        onNewDraft={handleNewDraft}
        onNewDraftForProblem={handleNewDraftForProblem}
      />

      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-slate-50">
        <div className="flex min-h-0 flex-1">
          <SolutionEditor
            key={initialSolution?.id ?? `draft:${initialProblem?.id ?? 'none'}:${draftGeneration}`}
            problem={initialProblem}
            initialSolution={initialSolution}
            initialContestId={initialSolution?.contestId ?? initialContestId}
            relatedSolutions={initialRelatedSolutions}
            availableTags={availableTags}
            draftState={draftState}
            onDraftChange={setDraftState}
            onDraftSaved={handleDraftSaved}
            onCreateRecord={handleCreateRecord}
            onProblemSelected={handleSelectProblem}
            onSelectSolution={handleSelectSolution}
            isAuthenticated={isAuthenticated}
            notice={notice}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
