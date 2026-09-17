'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import SolutionsSidebar from '@/features/solutions/components/SolutionsSidebar';
import SolutionEditor from '@/features/solutions/components/SolutionEditor';
import type {
  SolutionDraftState,
  SolutionListItem,
  SolutionRecordListItem,
  SolutionWithTags,
  SolutionStatus,
} from '@/features/solutions/types';
import type {
  ProblemDetail,
  ProblemSearchResult,
  SelectableTag,
} from '@/features/problems/types';

interface SolutionsWorkspaceProps {
  solutions: SolutionListItem[];
  availableTags: SelectableTag[];
  initialProblem: ProblemDetail | null;
  initialSolution: SolutionWithTags | null;
  initialContestId: string | null;
  initialRelatedSolutions: SolutionRecordListItem[];
  problemSearchQuery: string;
  problemSearchResults: ProblemSearchResult[];
  isAuthenticated: boolean;
  notice?: ReactNode;
}

const DEFAULT_CONTENT = JSON.stringify([{ type: 'p', children: [{ text: '' }] }]);
const DEFAULT_STATUS: SolutionStatus = 'AC';
const EMPTY_DRAFT_STATE: SolutionDraftState = {
  title: '',
  content: DEFAULT_CONTENT,
  status: DEFAULT_STATUS,
  tags: [],
  contestId: null,
};

export default function SolutionsWorkspace({
  solutions,
  availableTags,
  initialProblem,
  initialSolution,
  initialContestId,
  initialRelatedSolutions,
  problemSearchQuery,
  problemSearchResults,
  isAuthenticated,
  notice,
}: SolutionsWorkspaceProps) {
  const [draftState, setDraftState] = useState<SolutionDraftState>(EMPTY_DRAFT_STATE);
  const router = useRouter();

  const handleSelectSolution = useCallback((solutionId: string) => {
    if (solutionId === initialSolution?.id) return;
    router.push(`/solutions/${solutionId}`);
  }, [initialSolution?.id, router]);

  const handleSelectProblem = useCallback((problemId: string) => {
    const target = initialSolution
      ? `/solutions/${initialSolution.id}?problemId=${encodeURIComponent(problemId)}`
      : `/solutions/new?problemId=${encodeURIComponent(problemId)}`;
    router.push(target);
  }, [initialSolution, router]);

  const handleNewDraft = useCallback(() => {
    router.push('/solutions/new');
  }, [router]);

  return (
    <SidebarProvider className="h-full !min-h-0">

      <SolutionsSidebar
        solutions={solutions}
        selectedSolutionId={initialSolution?.id ?? null}
        onSelectSolution={handleSelectSolution}
        onNewDraft={handleNewDraft}
      />

      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-slate-50">
        <div className="flex min-h-0 flex-1">
          <SolutionEditor
            key={initialSolution?.id ?? `draft:${initialProblem?.id ?? 'none'}`}
            problem={initialProblem}
            initialSolution={initialSolution}
            initialContestId={initialSolution?.contestId ?? initialContestId}
            relatedSolutions={initialRelatedSolutions}
            availableTags={availableTags}
            draftState={draftState}
            onDraftChange={setDraftState}
            onProblemSelected={handleSelectProblem}
            onSelectSolution={handleSelectSolution}
            problemSearchQuery={problemSearchQuery}
            problemSearchResults={problemSearchResults}
            isAuthenticated={isAuthenticated}
            notice={notice}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
