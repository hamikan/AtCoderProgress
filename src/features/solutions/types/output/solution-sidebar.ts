import type { SolutionListItem } from './solution';

export interface SolutionSidebarContestGroup {
  contestId: string;
  label: string;
  problems: SolutionListItem[];
}

export interface SolutionSidebarTypeGroup {
  type: string;
  contests: SolutionSidebarContestGroup[];
}
