import type { SolutionStatus } from '../output/solution';

export interface SolutionDraftState {
  title: string;
  content: string;
  status: SolutionStatus;
  tags: string[];
  contestId: string | null;
}

export type SolutionSaveState = 'idle' | 'saving' | 'saved' | 'error';
