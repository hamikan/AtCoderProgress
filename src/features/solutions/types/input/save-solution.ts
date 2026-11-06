import type { SolutionStatus } from '../output/solution';

export interface SaveSolutionInput {
  solutionId?: string | null;
  problemId: string;
  contestId: string;
  title: string | null;
  content: string;
  status: SolutionStatus;
  tagNames: string[];
}

export type SavePayload = Omit<SaveSolutionInput, 'solutionId'>;
