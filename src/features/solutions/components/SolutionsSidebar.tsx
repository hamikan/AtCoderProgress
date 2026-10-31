'use client';

import { useMemo, useState } from 'react';
import { BookOpen, ChevronRight, Plus, Search } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getDifficultyColor, getDifficultyOrbColor } from '@/lib/atcoder/difficulty';
import { formatSolutionRecordLabel } from '@/features/solutions/functions/solution-editor';
import { buildSolutionSidebarHierarchy } from '@/features/solutions/functions/solution-sidebar-hierarchy';
import type { SolutionListItem } from '@/features/solutions/types';

interface SolutionsSidebarProps {
  solutions: SolutionListItem[];
  selectedSolutionId: string | null;
  onSelectSolution: (solutionId: string) => void;
  onNewDraft: () => void;
}

function problemContainsSelected(
  problem: SolutionListItem,
  selectedSolutionId: string | null
): boolean {
  return problem.records.some((record) => record.id === selectedSolutionId);
}

export default function SolutionsSidebar({
  solutions,
  selectedSolutionId,
  onSelectSolution,
  onNewDraft,
}: SolutionsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredSolutions = useMemo(() => {
    if (!normalizedSearchQuery) {
      return solutions;
    }

    return solutions.filter((solution) =>
      solution.problemName.toLowerCase().includes(normalizedSearchQuery) ||
      solution.problemId.toLowerCase().includes(normalizedSearchQuery) ||
      solution.contestId.toLowerCase().includes(normalizedSearchQuery)
    );
  }, [normalizedSearchQuery, solutions]);

  const hierarchy = useMemo(
    () => buildSolutionSidebarHierarchy(filteredSolutions),
    [filteredSolutions]
  );

  return (
    <Sidebar collapsible="icon" className="!top-0 !pt-0">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-3 group-data-[collapsible=icon]:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <BookOpen className="size-4" />
            </div>
            <span className="truncate text-sm font-bold tracking-tight">解法記録</span>
          </div>
          <Button
            onClick={onNewDraft}
            size="sm"
            className="h-8 shrink-0 bg-emerald-600 px-2.5 hover:bg-emerald-700"
          >
            <Plus className="size-4" />
            <span>追加</span>
          </Button>
        </div>

        <Button
          onClick={onNewDraft}
          size="icon"
          className="hidden size-8 bg-emerald-600 hover:bg-emerald-700 group-data-[collapsible=icon]:inline-flex"
          title="新しい解法記録を作成"
        >
          <Plus className="size-4" />
        </Button>

        <div className="mt-2 group-data-[collapsible=icon]:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <SidebarInput
              placeholder="記録済みの解法を検索..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {hierarchy.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400 group-data-[collapsible=icon]:hidden">
            {normalizedSearchQuery ? '一致する解法が見つかりません' : '解法がまだありません'}
          </div>
        )}

        <SidebarMenu>
          {hierarchy.map((typeGroup) => (
            <Collapsible
              key={typeGroup.type}
              className="group/type"
              defaultOpen={typeGroup.contests.some((contest) =>
                contest.problems.some((problem) =>
                  problemContainsSelected(problem, selectedSolutionId)
                )
              )}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="font-semibold">
                    <ChevronRight className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/type:rotate-90" />
                    <span>{typeGroup.type}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub className="mr-px pr-0">
                    {typeGroup.contests.map((contest) => (
                      <Collapsible
                        key={contest.contestId}
                        className="group/contest"
                        defaultOpen={contest.problems.some((problem) =>
                          problemContainsSelected(problem, selectedSolutionId)
                        )}
                      >
                        <SidebarMenuSubItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton className="font-medium">
                              <ChevronRight className="size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/contest:rotate-90" />
                              <span>{contest.label}</span>
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub className="ml-2 mr-px pr-0">
                              {contest.problems.map((problem) => (
                                <Collapsible
                                  key={`${problem.contestId}:${problem.problemId}`}
                                  className="group/problem"
                                  defaultOpen={problemContainsSelected(
                                    problem,
                                    selectedSolutionId
                                  )}
                                >
                                  <SidebarMenuSubItem>
                                    <CollapsibleTrigger asChild>
                                      <SidebarMenuSubButton className="cursor-pointer">
                                        <ChevronRight className="size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/problem:rotate-90" />
                                        <span
                                          aria-hidden
                                          className={`size-2.5 shrink-0 rounded-full border border-black/15 ${getDifficultyOrbColor(problem.difficulty)}`}
                                        />
                                        <span className="min-w-0 flex-1 truncate">
                                          {problem.problemIndex} - {problem.problemName}
                                        </span>
                                        {problem.difficulty !== null && (
                                          <span
                                            className={`shrink-0 text-[10px] font-bold ${getDifficultyColor(problem.difficulty)}`}
                                          >
                                            {problem.difficulty}
                                          </span>
                                        )}
                                      </SidebarMenuSubButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                      <SidebarMenuSub className="ml-2 mr-px pr-0">
                                        {problem.records.map((record, index) => (
                                          <SidebarMenuSubItem key={record.id}>
                                            <SidebarMenuSubButton
                                              size="sm"
                                              isActive={record.id === selectedSolutionId}
                                              onClick={() => onSelectSolution(record.id)}
                                              className="relative cursor-pointer data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-950"
                                            >
                                              {record.id === selectedSolutionId && (
                                                <span
                                                  aria-hidden
                                                  className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-emerald-600"
                                                />
                                              )}
                                              <span className="min-w-0 flex-1 truncate pl-1">
                                                {formatSolutionRecordLabel(record, index)}
                                              </span>
                                            </SidebarMenuSubButton>
                                          </SidebarMenuSubItem>
                                        ))}
                                      </SidebarMenuSub>
                                    </CollapsibleContent>
                                  </SidebarMenuSubItem>
                                </Collapsible>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuSubItem>
                      </Collapsible>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
