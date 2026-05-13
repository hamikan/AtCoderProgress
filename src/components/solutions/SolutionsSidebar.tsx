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
import { getDifficultyColor } from '@/lib/utils';
import type { SolutionListItem } from '@/lib/services/db/solution';

interface SolutionsSidebarProps {
  solutions: SolutionListItem[];
  selectedSolutionId: string | null;
  onSelectSolution: (solutionId: string) => void;
  onNewDraft: () => void;
}

interface ContestGroup {
  contestId: string;
  contestNumber: string;
  problems: SolutionListItem[];
}

interface TypeGroup {
  type: string;
  contests: ContestGroup[];
}

function parseContestId(contestId: string): { type: string; number: string } {
  const match = contestId.match(/^([a-zA-Z]+)(\d+)$/);
  if (!match) {
    return { type: contestId.toUpperCase(), number: '' };
  }

  return {
    type: match[1].toUpperCase(),
    number: match[2],
  };
}

function buildHierarchy(solutions: SolutionListItem[]): TypeGroup[] {
  const typeMap = new Map<string, Map<string, SolutionListItem[]>>();

  for (const solution of solutions) {
    const { type } = parseContestId(solution.contestId);

    if (!typeMap.has(type)) {
      typeMap.set(type, new Map());
    }

    const contestMap = typeMap.get(type)!;
    if (!contestMap.has(solution.contestId)) {
      contestMap.set(solution.contestId, []);
    }

    contestMap.get(solution.contestId)!.push(solution);
  }

  const priority = ['ABC', 'ARC', 'AGC'];
  const sortedTypes = [...typeMap.keys()].sort((a, b) => {
    const priorityA = priority.indexOf(a);
    const priorityB = priority.indexOf(b);

    if (priorityA !== -1 && priorityB !== -1) {
      return priorityA - priorityB;
    }

    if (priorityA !== -1) {
      return -1;
    }

    if (priorityB !== -1) {
      return 1;
    }

    return a.localeCompare(b);
  });

  return sortedTypes.map((type) => {
    const contestMap = typeMap.get(type)!;
    const contests = [...contestMap.entries()]
      .sort((a, b) => {
        const contestA = parseInt(parseContestId(a[0]).number, 10) || 0;
        const contestB = parseInt(parseContestId(b[0]).number, 10) || 0;
        return contestB - contestA;
      })
      .map(([contestId, problems]) => ({
        contestId,
        contestNumber: parseContestId(contestId).number,
        problems: [...problems].sort((a, b) => a.problemIndex.localeCompare(b.problemIndex)),
      }));

    return { type, contests };
  });
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

  const hierarchy = useMemo(() => buildHierarchy(filteredSolutions), [filteredSolutions]);

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
              defaultOpen={typeGroup.contests.some((contest) =>
                contest.problems.some((problem) => problem.latestSolutionId === selectedSolutionId)
              )}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="font-semibold">
                    <ChevronRight className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    <span>{typeGroup.type}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {typeGroup.contests.map((contest) => (
                      <Collapsible
                        key={contest.contestId}
                        defaultOpen={contest.problems.some((problem) => problem.latestSolutionId === selectedSolutionId)}
                      >
                        <SidebarMenuSubItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton className="font-medium">
                              <ChevronRight className="size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              <span>{contest.contestNumber}</span>
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub className="ml-2">
                              {contest.problems.map((solution) => (
                                <SidebarMenuSubItem key={`${solution.contestId}:${solution.problemId}`}>
                                  <SidebarMenuSubButton
                                    isActive={solution.latestSolutionId === selectedSolutionId}
                                    onClick={() => onSelectSolution(solution.latestSolutionId)}
                                    className="cursor-pointer"
                                  >
                                    <span className="truncate">
                                      {solution.problemIndex} - {solution.problemName}
                                    </span>
                                    {solution.solutionCount > 1 && (
                                      <span className="ml-auto shrink-0 text-[10px] font-bold text-slate-400">
                                        {solution.solutionCount}
                                      </span>
                                    )}
                                    {solution.difficulty !== null && (
                                      <span className={`shrink-0 text-[10px] font-bold ${getDifficultyColor(solution.difficulty)}`}>
                                        {solution.difficulty}
                                      </span>
                                    )}
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
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
