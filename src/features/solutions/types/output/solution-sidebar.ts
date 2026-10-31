import type { SolutionListItem } from './solution';

export interface SolutionSidebarContestProblem {
  contestId: string;
  problemId: string;
  problemIndex: string;
  problemName: string;
  difficulty: number | null;
}

export interface SolutionSidebarProblemOption extends SolutionSidebarContestProblem {
  recorded: boolean;
}

export interface SolutionSidebarContestGroup {
  contestId: string;
  label: string;
  problems: SolutionListItem[];
  problemOptions: SolutionSidebarProblemOption[];
}

export interface SolutionSidebarTypeGroup {
  type: string;
  contests: SolutionSidebarContestGroup[];
}
