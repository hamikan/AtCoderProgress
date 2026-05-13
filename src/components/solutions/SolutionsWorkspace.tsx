'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import SolutionsSidebar from '@/components/solutions/SolutionsSidebar';
import SolutionEditor from '@/components/solutions/SolutionEditor';
import type { SolutionDraftState } from '@/components/solutions/SolutionEditor';
import type {
  SolutionListItem,
  SolutionRecordListItem,
  SolutionWithTags,
  ProblemDetail,
} from '@/lib/services/db/solution';
import type { AvailableTag } from '@/lib/services/db/tag';
import { getProblemDetailAction } from '@/lib/actions/solution';
import type { SolutionStatus } from '@prisma/client';

interface SolutionsWorkspaceProps {
  solutions: SolutionListItem[];
  availableTags: AvailableTag[];
  initialProblem: ProblemDetail | null;
  initialSolution: SolutionWithTags | null;
  initialContestId: string | null;
  initialRelatedSolutions: SolutionRecordListItem[];
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
}: SolutionsWorkspaceProps) {
  const [currentProblem, setCurrentProblem] = useState<ProblemDetail | null>(initialProblem);
  const [currentSolution, setCurrentSolution] = useState<SolutionWithTags | null>(initialSolution);
  const [isLoading, setIsLoading] = useState(false);
  const [draftState, setDraftState] = useState<SolutionDraftState>(EMPTY_DRAFT_STATE);
  const [relatedSolutions, setRelatedSolutions] = useState<SolutionRecordListItem[]>(initialRelatedSolutions);
  const router = useRouter();

  useEffect(() => {
    setCurrentProblem(initialProblem);
    setCurrentSolution(initialSolution);
    setRelatedSolutions(initialRelatedSolutions);
    setDraftState(EMPTY_DRAFT_STATE);
  }, [initialProblem, initialRelatedSolutions, initialSolution]);

  const handleSelectSolution = useCallback((solutionId: string) => {
    if (solutionId === currentSolution?.id) return;
    router.push(`/solutions/${solutionId}`);
  }, [currentSolution?.id, router]);

  const handleSelectProblem = useCallback(async (problemId: string) => {
    setIsLoading(true);
    try {
      const problem = await getProblemDetailAction(problemId);
      setCurrentProblem(problem);
      setRelatedSolutions([]);
      setDraftState((currentDraft) => ({
        ...currentDraft,
        contestId: null,
      }));
    } catch (error) {
      console.error('Failed to load problem:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewDraft = useCallback(() => {
    router.push('/solutions/new');
  }, [router]);

  return (
    <SidebarProvider className="h-full !min-h-0">

      <SolutionsSidebar
        solutions={solutions}
        selectedSolutionId={currentSolution?.id ?? null}
        onSelectSolution={handleSelectSolution}
        onNewDraft={handleNewDraft}
      />

      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-slate-50">
        <div className="flex min-h-0 flex-1">
          {isLoading ? (
            <div className="mx-auto max-w-3xl px-8 py-12">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-slate-100 rounded-lg w-1/3" />
                <div className="space-y-3">
                  <div className="h-4 bg-slate-50 rounded w-full" />
                  <div className="h-4 bg-slate-50 rounded w-5/6" />
                  <div className="h-4 bg-slate-50 rounded w-4/6" />
                </div>
              </div>
            </div>
          ) : (
            <SolutionEditor
              key={currentSolution?.id ?? `draft:${currentProblem?.id ?? 'none'}`}
              problem={currentProblem}
              initialSolution={currentSolution}
              initialContestId={currentSolution?.contestId ?? initialContestId}
              relatedSolutions={relatedSolutions}
              availableTags={availableTags}
              draftState={draftState}
              onDraftChange={setDraftState}
              onProblemSelected={handleSelectProblem}
              onRelatedSolutionsChange={setRelatedSolutions}
              onSelectSolution={handleSelectSolution}
            />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
