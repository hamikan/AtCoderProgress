import { SolutionStatus } from '@prisma/client';

export interface Problem {
  id: string;
  name: string;
  difficulty: number | null;
  totalSolutionCount: number;
}

export interface ProblemListItem {
  id: string;
  name: string;
  contestId: string;
  problemIndex: string;
  difficulty: number | null;
  status?: SolutionStatus;
  tags?: string[];
  totalSolutionCount?: number;
}