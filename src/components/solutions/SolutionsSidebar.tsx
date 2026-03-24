'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, CheckCircle, Clock, Eye, XCircle, BookOpen, ChevronRight } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getDifficultyColor } from '@/lib/utils';
import type { SolutionListItem } from '@/lib/services/db/solution';
import type { SolutionStatus } from '@prisma/client';

interface SolutionsSidebarProps {
  solutions: SolutionListItem[];
  selectedProblemId: string | null;
  onSelectProblem: (problemId: string) => void;
  onNewDraft: () => void;
}

const statusConfig: Record<SolutionStatus, { icon: typeof CheckCircle; color: string }> = {
  AC: { icon: CheckCircle, color: 'text-emerald-600' },
  SELF_AC: { icon: CheckCircle, color: 'text-amber-600' },
  EXPLANATION_AC: { icon: Eye, color: 'text-blue-600' },
  REVIEW_AC: { icon: BookOpen, color: 'text-purple-600' },
  TRYING: { icon: Clock, color: 'text-slate-500' },
  UNSOLVED: { icon: XCircle, color: 'text-red-500' },
};

/**
 * contestId (e.g. "abc301") → { type: "ABC", number: "301" }
 */
function parseContestId(contestId: string): { type: string; number: string } {
  const match = contestId.match(/^([a-zA-Z]+)(\d+)$/);
  if (!match) return { type: contestId.toUpperCase(), number: '' };
  return { type: match[1].toUpperCase(), number: match[2] };
}

/**
 * problemId (e.g. "abc301_d") → label: "D"
 */
function getProblemLabel(problemId: string): string {
  const parts = problemId.split('_');
  const suffix = parts[parts.length - 1];
  return suffix.toUpperCase();
}

interface ContestGroup {
  contestId: string;
  displayName: string;
  problems: SolutionListItem[];
}

interface TypeGroup {
  type: string;
  contests: ContestGroup[];
}

function buildHierarchy(solutions: SolutionListItem[]): TypeGroup[] {
  const typeMap = new Map<string, Map<string, SolutionListItem[]>>();

  for (const sol of solutions) {
    const { type, number } = parseContestId(sol.contestId);
    if (!typeMap.has(type)) typeMap.set(type, new Map());
    const contestMap = typeMap.get(type)!;
    const contestKey = sol.contestId;
    if (!contestMap.has(contestKey)) contestMap.set(contestKey, []);
    contestMap.get(contestKey)!.push(sol);
  }

  const result: TypeGroup[] = [];
  // Sort type groups: ABC first, then ARC, AGC, then others alphabetically
  const priority = ['ABC', 'ARC', 'AGC'];
  const sortedTypes = [...typeMap.keys()].sort((a, b) => {
    const ai = priority.indexOf(a);
    const bi = priority.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  for (const type of sortedTypes) {
    const contestMap = typeMap.get(type)!;
    const contests: ContestGroup[] = [];

    // Sort contests by number descending (newest first)
    const sortedContests = [...contestMap.entries()].sort((a, b) => {
      const numA = parseInt(parseContestId(a[0]).number) || 0;
      const numB = parseInt(parseContestId(b[0]).number) || 0;
      return numB - numA;
    });

    for (const [contestId, problems] of sortedContests) {
      const { number } = parseContestId(contestId);
      // Sort problems by label (A, B, C...)
      problems.sort((a, b) => getProblemLabel(a.problemId).localeCompare(getProblemLabel(b.problemId)));
      contests.push({
        contestId,
        displayName: `${type}${number}`,
        problems,
      });
    }

    result.push({ type, contests });
  }

  return result;
}

export default function SolutionsSidebar({
  solutions,
  selectedProblemId,
  onSelectProblem,
  onNewDraft,
}: SolutionsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSolutions = useMemo(() =>
    solutions.filter(s =>
      s.problemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contestId.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [solutions, searchQuery]
  );

  const hierarchy = useMemo(() => buildHierarchy(filteredSolutions), [filteredSolutions]);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <div className="size-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <BookOpen className="size-4" />
          </div>
          <span className="text-sm font-bold tracking-tight">解法記録</span>
        </div>
        <div className="group-data-[collapsible=icon]:hidden mt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <SidebarInput
              placeholder="問題を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {hierarchy.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400 group-data-[collapsible=icon]:hidden">
            {searchQuery ? '一致する解法が見つかりません' : '解法がまだありません'}
          </div>
        )}

        {hierarchy.map((typeGroup) => (
          <SidebarGroup key={typeGroup.type}>
            <SidebarGroupLabel>{typeGroup.type}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {typeGroup.contests.map((contest) => (
                  <Collapsible key={contest.contestId} defaultOpen={
                    contest.problems.some(p => p.problemId === selectedProblemId)
                  }>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="font-medium">
                          <ChevronRight className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          <span>{contest.displayName}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {contest.problems.map((sol) => {
                            const config = statusConfig[sol.status];
                            const StatusIcon = config.icon;
                            const label = getProblemLabel(sol.problemId);
                            const isActive = selectedProblemId === sol.problemId;

                            return (
                              <SidebarMenuSubItem key={sol.id}>
                                <SidebarMenuSubButton
                                  isActive={isActive}
                                  onClick={() => onSelectProblem(sol.problemId)}
                                  className="cursor-pointer"
                                >
                                  <StatusIcon className={`size-3.5 shrink-0 ${config.color}`} />
                                  <span className="truncate">
                                    {label} - {sol.problemName}
                                  </span>
                                  {sol.difficulty !== null && (
                                    <span className={`ml-auto text-[10px] font-bold shrink-0 ${getDifficultyColor(sol.difficulty)}`}>
                                      {sol.difficulty}
                                    </span>
                                  )}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-slate-200">
        <Button
          onClick={onNewDraft}
          size="icon"
          className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
        >
          <Plus className="size-4" />
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
