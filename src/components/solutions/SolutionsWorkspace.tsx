'use client';

import { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import SolutionsSidebar from '@/components/solutions/SolutionsSidebar';
import SolutionEditor from '@/components/solutions/SolutionEditor';
import type { SolutionListItem } from '@/lib/services/db/solution';
import type { SolutionWithTags } from '@/lib/services/db/solution';
import type { AvailableTag } from '@/lib/services/db/tag';

interface ProblemDetail {
  id: string;
  name: string;
  difficulty: number | null;
  firstContest: { id: string };
}

interface SolutionsWorkspaceProps {
  solutions: SolutionListItem[];
  availableTags: AvailableTag[];
  initialProblem: ProblemDetail | null;
  initialSolution: SolutionWithTags | null;
}

export default function SolutionsWorkspace({
  solutions,
  availableTags,
  initialProblem,
  initialSolution,
}: SolutionsWorkspaceProps) {
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    initialProblem?.id ?? null
  );
  const [currentProblem, setCurrentProblem] = useState<ProblemDetail | null>(initialProblem);
  const [currentSolution, setCurrentSolution] = useState<SolutionWithTags | null>(initialSolution);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(initialProblem === null);

  const handleSelectProblem = useCallback(async (problemId: string) => {
    if (problemId === selectedProblemId && !isDraft) return;

    setSelectedProblemId(problemId);
    setIsDraft(false);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/solutions/${problemId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentProblem(data.problem);
        setCurrentSolution(data.solution);
      }
    } catch (error) {
      console.error('Failed to load solution:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProblemId, isDraft]);

  const handleNewDraft = useCallback(() => {
    setSelectedProblemId(null);
    setCurrentProblem(null);
    setCurrentSolution(null);
    setIsDraft(true);
  }, []);

  return (
    <SidebarProvider>

      <SolutionsSidebar
        solutions={solutions}
        selectedProblemId={selectedProblemId}
        onSelectProblem={handleSelectProblem}
        onNewDraft={handleNewDraft}
      />

      <SidebarInset>

        <div className="flex-1 bg-white">
          {isLoading ? (
            <div className="max-w-3xl mx-auto py-12 px-8">
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
              key={currentProblem?.id ?? 'draft'}
              problem={currentProblem}
              initialSolution={currentSolution}
              availableTags={availableTags}
              onProblemSelected={handleSelectProblem}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
